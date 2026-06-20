"use client";

// LeadForm — shared form for both creating and editing leads.
// Client Component: uses useActionState to connect to Server Actions,
// tracks pending state, and displays inline validation errors.
//
// Design: a single component handles both create and edit modes:
//   - Create mode: `action` = createLead, no initial values
//   - Edit mode:   `action` = bound updateLead(leadId), pre-filled values

import { useActionState } from "react";
import { LEAD_STATUS_LABELS, type LeadStatus, type LeadActionResult } from "@/src/features/leads/types/lead.types";

// The form accepts any async function matching the Server Action signature.
// In edit mode the caller pre-binds the leadId using .bind().
type LeadFormAction = (
  prevState: LeadActionResult | null,
  formData: FormData
) => Promise<LeadActionResult>;

interface LeadFormProps {
  action: LeadFormAction;
  // Pre-fill values for edit mode. Undefined in create mode.
  defaultValues?: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    status?: LeadStatus;
    deal_value?: number | null;
  };
  submitLabel?: string;
  cancelHref?: string;
}

const STATUS_OPTIONS = Object.entries(LEAD_STATUS_LABELS) as [LeadStatus, string][];

export default function LeadForm({
  action,
  defaultValues,
  submitLabel = "Save Lead",
  cancelHref = "/leads",
}: LeadFormProps) {
  const [state, formAction, pending] = useActionState<LeadActionResult | null, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      {/* Error banner */}
      {state && !state.success && (
        <div
          role="alert"
          className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      {/* Name — required */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name ?? ""}
          disabled={pending}
          placeholder="Jane Doe"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={defaultValues?.email ?? ""}
          disabled={pending}
          placeholder="jane@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={defaultValues?.phone ?? ""}
          disabled={pending}
          placeholder="+1 (555) 000-0000"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        />
      </div>

      {/* Company */}
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
          Company
        </label>
        <input
          id="company"
          name="company"
          type="text"
          defaultValue={defaultValues?.company ?? ""}
          disabled={pending}
          placeholder="Acme Corp"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        />
      </div>

      {/* Status — required */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          required
          defaultValue={defaultValues?.status ?? "new"}
          disabled={pending}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 bg-white"
        >
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Deal Value */}
      <div>
        <label htmlFor="deal_value" className="block text-sm font-medium text-gray-700 mb-1">
          Deal Value (USD)
        </label>
        <input
          id="deal_value"
          name="deal_value"
          type="number"
          min="0"
          step="0.01"
          defaultValue={defaultValues?.deal_value ?? ""}
          disabled={pending}
          placeholder="0.00"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <a
          href={cancelHref}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
