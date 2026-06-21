"use server";

// Notes Server Actions — create, update, delete, and fetch notes.
// All operations are scoped to the authenticated user via session + RLS.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import type { Note, NoteActionResult } from "@/src/features/notes/types/note.types";

// ─── Helper ────────────────────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  return { supabase, user };
}

// ─── getNotesByLeadId ──────────────────────────────────────────────────────────

/**
 * Fetches all notes for a given lead, ordered oldest-first (chronological).
 * Used in Server Components — not a form action.
 */
export async function getNotesByLeadId(leadId: string): Promise<Note[]> {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("lead_id", leadId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getNotesByLeadId] Supabase error:", error.message);
    return [];
  }

  return (data as Note[]) ?? [];
}

// ─── createNote ────────────────────────────────────────────────────────────────

/**
 * Creates a new note attached to a lead.
 * On success: revalidates the lead detail page and returns { success: true }.
 * On failure: returns a typed error for the form to display inline.
 *
 * Note: we return { success: true } instead of redirecting so the notes list
 * refreshes in place without navigating away from the lead detail page.
 */
export async function createNote(
  leadId: string,
  _prevState: NoteActionResult | null,
  formData: FormData
): Promise<NoteActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const content = formData.get("content");

  if (typeof content !== "string" || !content.trim()) {
    return { success: false, error: "Note content cannot be empty." };
  }

  const { error } = await supabase.from("notes").insert({
    lead_id: leadId,
    user_id: user.id,
    content: content.trim(),
  });

  if (error) {
    console.error("[createNote] Supabase error:", error.message);
    return { success: false, error: "Failed to save note. Please try again." };
  }

  // Revalidate the lead detail page so the new note appears immediately.
  revalidatePath(`/leads/${leadId}`);
  return { success: true };
}

// ─── updateNote ────────────────────────────────────────────────────────────────

/**
 * Updates the content of an existing note.
 * Ownership is enforced via .eq("user_id") and RLS.
 */
export async function updateNote(
  noteId: string,
  leadId: string,
  _prevState: NoteActionResult | null,
  formData: FormData
): Promise<NoteActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const content = formData.get("content");

  if (typeof content !== "string" || !content.trim()) {
    return { success: false, error: "Note content cannot be empty." };
  }

  const { error } = await supabase
    .from("notes")
    .update({ content: content.trim() })
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[updateNote] Supabase error:", error.message);
    return { success: false, error: "Failed to update note. Please try again." };
  }

  revalidatePath(`/leads/${leadId}`);
  return { success: true };
}

// ─── deleteNote ────────────────────────────────────────────────────────────────

/**
 * Deletes a note permanently.
 * Called from the NoteItem component using useTransition.
 */
export async function deleteNote(
  noteId: string,
  leadId: string
): Promise<NoteActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[deleteNote] Supabase error:", error.message);
    return { success: false, error: "Failed to delete note." };
  }

  revalidatePath(`/leads/${leadId}`);
  return { success: true };
}
