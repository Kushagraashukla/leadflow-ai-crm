export const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";

export const AI_MODEL = "llama3.2" as const;

export const SUMMARY_SYSTEM_PROMPT = `You are an expert sales analyst for a CRM system.
Given information about a sales lead and their interaction notes, produce:
1. A concise 2-3 sentence summary of the lead's situation and potential.
2. Three specific, actionable next steps for the sales team.

Respond ONLY with valid JSON in this exact format, with no additional text:
{
  "summary": "string",
  "next_actions": ["string", "string", "string"]
}

Be direct, professional, and specific. Output only the JSON object.`;

export interface OllamaChatResponse {
  model: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}
