"use client";

// NoteItem — renders a single note with inline editing and delete support.
// Client Component: manages local edit mode state.
//
// States:
//   View mode  — shows note content + timestamp + Edit/Delete buttons
//   Edit mode  — shows a pre-filled textarea + Save/Cancel + useActionState

import { useState, useTransition, useActionState } from "react";
import { updateNote, deleteNote } from "@/src/features/notes/actions/note.actions";
import type { Note, NoteActionResult } from "@/src/features/notes/types/note.types";

interface NoteItemProps {
  note: Note;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function NoteItem({ note }: NoteItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletePending, startDeleteTransition] = useTransition();

  // Bind the Server Action with this note's IDs.
  // updateNote signature: (noteId, leadId, prevState, formData)
  // After binding: (prevState, formData) — matches useActionState
  const updateAction = updateNote.bind(null, note.id, note.lead_id);

  const [editState, editFormAction, editPending] = useActionState<
    NoteActionResult | null,
    FormData
  >(updateAction, null);

  // Switch back to view mode after a successful update.
  // The parent page revalidates from the Server Action and re-renders.
  if (editState?.success && isEditing) {
    setIsEditing(false);
  }

  function handleDelete() {
    const confirmed = window.confirm("Delete this note?");
    if (!confirmed) return;

    startDeleteTransition(async () => {
      await deleteNote(note.id, note.lead_id);
    });
  }

  return (
    <div className={`p-4 ${isDeletePending ? "opacity-50" : ""}`}>
      {isEditing ? (
        /* ── Edit mode ───────────────────────────────────────────────────── */
        <form action={editFormAction} className="space-y-2">
          {editState && !editState.success && (
            <p role="alert" className="text-xs text-red-600">
              {editState.error}
            </p>
          )}
          <textarea
            name="content"
            required
            rows={3}
            defaultValue={note.content}
            disabled={editPending}
            autoFocus
            className="w-full px-3 py-2 border border-blue-400 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={editPending}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-60"
            >
              {editPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={editPending}
              className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* ── View mode ───────────────────────────────────────────────────── */
        <div className="flex items-start gap-3">
          {/* Avatar dot */}
          <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-400 shrink-0" />

          <div className="flex-1 min-w-0">
            {/* Note content */}
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {note.content}
            </p>

            {/* Metadata + actions row */}
            <div className="mt-1.5 flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {formatRelativeTime(note.created_at)}
                {note.updated_at !== note.created_at && " · edited"}
              </span>

              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeletePending}
                className="text-xs text-gray-400 hover:text-red-600 transition-colors disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
