"use client";

// DeleteLeadButton — Client Component for the lead delete action.
// Uses a native browser confirm() dialog to prevent accidental deletions.
// Calls the deleteLead Server Action via a form submission.

import { useTransition } from "react";
import { deleteLead } from "@/src/features/leads/actions/lead.actions";

interface DeleteLeadButtonProps {
  leadId: string;
  leadName: string;
}

export default function DeleteLeadButton({ leadId, leadName }: DeleteLeadButtonProps) {
  // useTransition gives us the pending state without useActionState,
  // suitable for fire-and-redirect actions that don't return error state.
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    // Native confirm dialog — simple and effective for MVP.
    const confirmed = window.confirm(
      `Are you sure you want to delete "${leadName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      await deleteLead(leadId);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? "Deleting…" : "Delete Lead"}
    </button>
  );
}
