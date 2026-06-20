"use server";

// Lead Server Actions — all CRUD operations run exclusively on the server.
// User identity is always read from the verified Supabase session,
// never from client-supplied data.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import type { Lead, LeadActionResult, LeadStatus } from "@/src/features/leads/types/lead.types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Validates and extracts the authenticated user from the current session.
// Throws (redirects) to /login if no session exists.
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { supabase, user };
}

// Valid status values — used to validate form input before touching the DB.
const VALID_STATUSES: LeadStatus[] = [
  "new", "contacted", "qualified", "proposal_sent", "won", "lost",
];

// ─── createLead ────────────────────────────────────────────────────────────────

/**
 * Creates a new lead owned by the authenticated user.
 * On success: revalidates the leads list cache and redirects to /leads.
 * On failure: returns a typed error for the form to display.
 */
export async function createLead(
  _prevState: LeadActionResult | null,
  formData: FormData
): Promise<LeadActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  // ── Extract fields from FormData ──────────────────────────────────────────
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const company = formData.get("company");
  const status = formData.get("status");
  const dealValueRaw = formData.get("deal_value");

  // ── Validate required fields ──────────────────────────────────────────────
  if (typeof name !== "string" || !name.trim()) {
    return { success: false, error: "Lead name is required." };
  }

  if (typeof status !== "string" || !VALID_STATUSES.includes(status as LeadStatus)) {
    return { success: false, error: "Please select a valid status." };
  }

  // Parse deal value — empty string becomes null (optional field)
  const deal_value =
    typeof dealValueRaw === "string" && dealValueRaw.trim() !== ""
      ? parseFloat(dealValueRaw)
      : null;

  if (deal_value !== null && isNaN(deal_value)) {
    return { success: false, error: "Deal value must be a valid number." };
  }

  // ── Insert into Supabase ──────────────────────────────────────────────────
  // user_id is set server-side from the verified session — never from the client.
  const { error } = await supabase.from("leads").insert({
    user_id: user.id,
    name: name.trim(),
    email: typeof email === "string" && email.trim() ? email.trim() : null,
    phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
    company: typeof company === "string" && company.trim() ? company.trim() : null,
    status: status as LeadStatus,
    deal_value,
  });

  if (error) {
    console.error("[createLead] Supabase error:", error.message);
    return { success: false, error: "Failed to create lead. Please try again." };
  }

  // Invalidate the leads list cache so the new lead appears immediately.
  revalidatePath("/leads");
  redirect("/leads");
}

// ─── updateLead ────────────────────────────────────────────────────────────────

/**
 * Updates an existing lead.
 * The lead must belong to the authenticated user (enforced by RLS + explicit check).
 */
export async function updateLead(
  leadId: string,
  _prevState: LeadActionResult | null,
  formData: FormData
): Promise<LeadActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const company = formData.get("company");
  const status = formData.get("status");
  const dealValueRaw = formData.get("deal_value");

  if (typeof name !== "string" || !name.trim()) {
    return { success: false, error: "Lead name is required." };
  }

  if (typeof status !== "string" || !VALID_STATUSES.includes(status as LeadStatus)) {
    return { success: false, error: "Please select a valid status." };
  }

  const deal_value =
    typeof dealValueRaw === "string" && dealValueRaw.trim() !== ""
      ? parseFloat(dealValueRaw)
      : null;

  if (deal_value !== null && isNaN(deal_value)) {
    return { success: false, error: "Deal value must be a valid number." };
  }

  const { error } = await supabase
    .from("leads")
    .update({
      name: name.trim(),
      email: typeof email === "string" && email.trim() ? email.trim() : null,
      phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
      company: typeof company === "string" && company.trim() ? company.trim() : null,
      status: status as LeadStatus,
      deal_value,
    })
    // Double-check ownership in the query even though RLS handles it.
    // This gives a clear "not found" rather than a silent RLS block.
    .eq("id", leadId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[updateLead] Supabase error:", error.message);
    return { success: false, error: "Failed to update lead. Please try again." };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  redirect(`/leads/${leadId}`);
}

// ─── deleteLead ────────────────────────────────────────────────────────────────

/**
 * Deletes a lead permanently.
 * RLS ensures only the owner can delete their leads.
 */
export async function deleteLead(leadId: string): Promise<LeadActionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", leadId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[deleteLead] Supabase error:", error.message);
    return { success: false, error: "Failed to delete lead." };
  }

  revalidatePath("/leads");
  redirect("/leads");
}

// ─── getLeads ──────────────────────────────────────────────────────────────────

/**
 * Fetches all leads for the authenticated user, ordered by creation date.
 * Used in Server Components — not a Server Action (no _prevState signature).
 */
export async function getLeads(): Promise<Lead[]> {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getLeads] Supabase error:", error.message);
    return [];
  }

  return (data as Lead[]) ?? [];
}

// ─── getLeadById ───────────────────────────────────────────────────────────────

/**
 * Fetches a single lead by ID for the authenticated user.
 * Returns null if the lead doesn't exist or belongs to another user.
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    // "PGRST116" = no rows found — expected if the lead doesn't exist
    if (error.code !== "PGRST116") {
      console.error("[getLeadById] Supabase error:", error.message);
    }
    return null;
  }

  return data as Lead;
}
