// Note domain types — single source of truth for the notes feature.

// ─── Row shape (mirrors the `notes` Supabase table) ───────────────────────────

export interface Note {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// ─── Server Action result ──────────────────────────────────────────────────────

export type NoteActionResult =
  | { success: true }
  | { success: false; error: string };
