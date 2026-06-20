// Dashboard layout — applies to all authenticated routes.
// Route group (dashboard) isolates this shell from the (auth) layout.
//
// Current state: pass-through layout — renders children directly.
// Next milestone additions:
//   - Session check via createClient() from src/lib/supabase/server.ts
//   - Redirect to /login if no active session
//   - Sidebar navigation component
//   - Top navigation bar component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Outer shell — full viewport height, flex row for sidebar + main content.
    // Sidebar will slot in here once the nav component is built.
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Placeholder top bar — replaced with full Topbar component in later milestone */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
        <span className="text-sm font-semibold text-gray-800">
          LeadFlow AI CRM
        </span>

        {/* Placeholder user section */}
        <div className="ml-auto text-xs text-gray-400">
          Dashboard
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
