"use client";

// AddNoteForm — inline textarea form for creating a new note on a lead.
// Client Component: uses useActionState to handle pending + error state.
// On success: resets the textarea (the page revalidates and shows the new note).

import { useActionState, useEffect, useRef } from "react";
import type { NoteActionResult } from "@/src/features/notes/types/note.types";

interface AddNoteFormProps {
  // The createNote Server Action pre-bound with the leadId.
  // Signature after binding: (prevState, formData) => Promise<NoteActionResult>
  action: (
    prevState: NoteActionResult | null,
    formData: FormData
  ) => Promise<NoteActionResult>;
}

export default function AddNoteForm({ action }: AddNoteFormProps) {
  const [state, formAction, pending] = useActionState<NoteActionResult | null, FormData>(
    action,
    null
  );

  const formRef = useRef<HTMLFormElement>(null);

  // Reset the form on success so the textarea clears after submission.
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      {/* Error banner */}
      {state && !state.success && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}

      <textarea
        name="content"
        required
        rows={3}
        disabled={pending}
        placeholder="Add a note about this lead…"
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Saving…" : "Add Note"}
        </button>
      </div>
    </form>
  );
}
