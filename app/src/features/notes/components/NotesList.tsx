// NotesList — Server Component that renders the full notes section for a lead.
//
// Why Server Component?
//   - Fetches notes data server-side (no useEffect, no loading state needed)
//   - Passes pre-bound Server Actions down to Client Components as props
//   - Keeps data fetching co-located with the component that needs it

import { getNotesByLeadId, createNote } from "@/src/features/notes/actions/note.actions";
import AddNoteForm from "@/src/features/notes/components/AddNoteForm";
import NoteItem from "@/src/features/notes/components/NoteItem";

interface NotesListProps {
  leadId: string;
}

export default async function NotesList({ leadId }: NotesListProps) {
  const notes = await getNotesByLeadId(leadId);

  // Pre-bind the leadId into createNote so AddNoteForm receives a
  // two-argument action (prevState, formData) matching useActionState's expectations.
  const createNoteForLead = createNote.bind(null, leadId);

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-lg">
      {/* Section header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-800">
          Notes
          {notes.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              {notes.length}
            </span>
          )}
        </h2>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="px-5 py-6 text-center text-sm text-gray-400">
          No notes yet. Add one below.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      )}

      {/* Add note form */}
      <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <AddNoteForm action={createNoteForLead} />
      </div>
    </div>
  );
}
