// Lead domain types.
// Single source of truth for all lead-related TypeScript types across the feature.

// ─── Enums ────────────────────────────────────────────────────────────────────

// Must match the `lead_status` PostgreSQL enum exactly.
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal_sent"
  | "won"
  | "lost";

// Human-readable labels for each status — used in the UI.
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal Sent",
  won: "Won",
  lost: "Lost",
};

// Badge colour classes per status — Tailwind CSS utility classes.
export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-gray-100 text-gray-700",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-yellow-100 text-yellow-700",
  proposal_sent: "bg-purple-100 text-purple-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

// ─── Row shape (from Supabase) ─────────────────────────────────────────────────

// Mirrors the `leads` table row exactly.
export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: LeadStatus;
  deal_value: number | null;
  created_at: string;
  updated_at: string;
}

// ─── Input shapes ──────────────────────────────────────────────────────────────

// Fields the user can set on create — user_id, id, and timestamps are server-generated.
export type CreateLeadInput = Pick<
  Lead,
  "name" | "email" | "phone" | "company" | "status" | "deal_value"
>;

// All fields on Lead are optional for partial updates except id.
export type UpdateLeadInput = Partial<CreateLeadInput>;

// ─── Server Action result ──────────────────────────────────────────────────────

export type LeadActionResult =
  | { success: true; leadId?: string }
  | { success: false; error: string };
