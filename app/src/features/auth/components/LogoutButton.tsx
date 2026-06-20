"use client";

// LogoutButton — minimal Client Component.
//
// Why a Client Component?
//   The dashboard layout is a Server Component (async, fetches session).
//   Buttons with onClick or forms calling Server Actions need to be
//   in a Client Component boundary. This keeps the boundary as small
//   as possible — only the button itself, not the whole layout.

import { signOut } from "@/src/features/auth/actions/auth.actions";

export default function LogoutButton() {
  return (
    // Using a <form> with action= (not onClick) means this works even
    // without JavaScript — pure progressive enhancement.
    <form action={signOut}>
      <button
        type="submit"
        className="text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded hover:bg-gray-100"
      >
        Sign Out
      </button>
    </form>
  );
}
