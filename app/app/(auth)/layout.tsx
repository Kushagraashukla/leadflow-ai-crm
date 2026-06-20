// Auth layout — applies to /login and /signup routes only.
// Route group (auth) keeps this layout isolated from the dashboard shell.
// No sidebar, no topbar — just a centered card container.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LeadFlow AI CRM",
  description: "Sign in to LeadFlow AI CRM",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Full-screen flex container — vertically and horizontally centers the auth card.
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Auth card container — width constrained for readability */}
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
