export interface AISummary {
  id: string;
  lead_id: string;
  user_id: string;
  summary: string;
  next_actions: string[];
  model_version: string;
  generated_at: string;
  created_at: string;
}

export type AISummaryActionResult =
  | { success: true; data: AISummary }
  | { success: false; error: string };

export interface AIModelResponse {
  summary: string;
  next_actions: string[];
}
