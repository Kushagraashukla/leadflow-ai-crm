// Dashboard layout — applies to all authenticated routes.
// Server Component: can use async/await and call Supabase directly.
//
// Responsibilities:
//   1. Secondary session validation (middleware is primary)
//   2. Render the app shell (topbar + main area)
//   3. Provide the LogoutButton wired to the signOut Server Action

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import LogoutButton from "@/src/features/auth/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Secondary session guard.
  // The middleware already protects this route — this is defence in depth.
  // getUser() re-validates the JWT with Supabase's server (cannot be spoofed).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no valid session, redirect to login.
  // This should normally be caught by middleware first, but handles
  // edge cases like expired tokens that slip past the edge check.
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top navigation bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 shrink-0">
        {/* App name / logo placeholder */}
        <span className="text-sm font-semibold text-gray-800">
          LeadFlow AI CRM
        </span>

        {/* Right side: user email + logout */}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs text-gray-500 hidden sm:block">
            {user.email}
          </span>
          {/* LogoutButton is a Client Component — needed for the form/button interaction */}
          <LogoutButton />
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
