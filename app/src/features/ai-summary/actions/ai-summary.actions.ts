"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import {
  OLLAMA_BASE_URL,
  AI_MODEL,
  SUMMARY_SYSTEM_PROMPT,
  type OllamaChatResponse,
} from "@/src/lib/openai";
import type {
  AISummary,
  AISummaryActionResult,
  AIModelResponse,
} from "@/src/features/ai-summary/types/ai-summary.types";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return { supabase, user };
}

async function callOllama(userPrompt: string): Promise<string> {
  let response: Response;

  try {
    response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: SUMMARY_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 512,
        },
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    const cause = (err as { cause?: { code?: string } })?.cause;
    if (
      cause?.code === "ECONNREFUSED" ||
      (err instanceof TypeError &&
        (err.message.includes("fetch") ||
          err.message.includes("ECONNREFUSED")))
    ) {
      throw new Error(
        "Ollama is not running. Start it with `ollama serve` and ensure the llama3.2 model is pulled."
      );
    }
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error(
        "Ollama took too long to respond (>60s). The model may still be loading — try again in a moment."
      );
    }
    throw new Error(`Network error: ${(err as Error).message}`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 404) {
      throw new Error(
        `Model "${AI_MODEL}" not found. Run: ollama pull ${AI_MODEL}`
      );
    }
    throw new Error(`Ollama API error (${response.status}): ${body}`);
  }

  const data = (await response.json()) as OllamaChatResponse;
  const content = data.message?.content;

  if (!content) {
    throw new Error("Ollama returned an empty response.");
  }

  return content;
}

export async function getAISummary(leadId: string): Promise<AISummary | null> {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("ai_summaries")
    .select("*")
    .eq("lead_id", leadId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[getAISummary] Supabase error:", error.message);
    }
    return null;
  }

  return data as AISummary;
}

export async function generateAISummary(
  leadId: string
): Promise<AISummaryActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const [leadResult, notesResult, existingSummaryResult] = await Promise.all([
    supabase
      .from("leads")
      .select("name, company, status, deal_value")
      .eq("id", leadId)
      .eq("user_id", user.id)
      .single(),

    supabase
      .from("notes")
      .select("content, updated_at")
      .eq("lead_id", leadId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("ai_summaries")
      .select("*")
      .eq("lead_id", leadId)
      .eq("user_id", user.id)
      .single(),
  ]);

  if (leadResult.error || !leadResult.data) {
    return { success: false, error: "Lead not found." };
  }

  const lead = leadResult.data;
  const notes = notesResult.data ?? [];
  const existingSummary = existingSummaryResult.data as AISummary | null;

  // Cache check — skip Ollama if nothing has changed
  if (existingSummary && notes.length > 0) {
    const lastNoteUpdate = notes.reduce(
      (latest, note) =>
        note.updated_at > latest ? note.updated_at : latest,
      notes[0].updated_at
    );

    if (lastNoteUpdate <= existingSummary.generated_at) {
      return { success: true, data: existingSummary };
    }
  }

  if (notes.length === 0) {
    return {
      success: false,
      error:
        "Add at least one note to this lead before generating a summary.",
    };
  }

  const notesText = notes
    .map((n, i) => `Note ${i + 1}: ${n.content}`)
    .join("\n");

  const userPrompt = `Lead: ${lead.name}
Company: ${lead.company ?? "Unknown"}
Status: ${lead.status}
Deal Value: ${lead.deal_value ? `$${lead.deal_value}` : "Not specified"}

Interaction Notes:
${notesText}`;

  let parsed: AIModelResponse;

  try {
    const rawContent = await callOllama(userPrompt);

    const cleaned = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    parsed = JSON.parse(cleaned) as AIModelResponse;

    if (
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.next_actions)
    ) {
      throw new Error("Model returned unexpected JSON shape.");
    }

    parsed.next_actions = parsed.next_actions.filter(
      (a): a is string => typeof a === "string"
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generateAISummary] Ollama error:", message);
    return { success: false, error: message };
  }

  const { data: upserted, error: upsertError } = await supabase
    .from("ai_summaries")
    .upsert(
      {
        lead_id: leadId,
        user_id: user.id,
        summary: parsed.summary,
        next_actions: parsed.next_actions,
        model_version: AI_MODEL,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "lead_id" }
    )
    .select()
    .single();

  if (upsertError || !upserted) {
    console.error(
      "[generateAISummary] Supabase upsert error:",
      upsertError?.message
    );
    return { success: false, error: "Summary generated but failed to save." };
  }

  revalidatePath(`/leads/${leadId}`);
  return { success: true, data: upserted as AISummary };
}

export async function deleteAISummary(leadId: string): Promise<void> {
  const { supabase, user } = await getAuthenticatedUser();

  await supabase
    .from("ai_summaries")
    .delete()
    .eq("lead_id", leadId)
    .eq("user_id", user.id);

  revalidatePath(`/leads/${leadId}`);
}
