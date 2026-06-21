// Login page — route: /login
//
// Next.js requires any component that calls useSearchParams() to be wrapped in
// a <Suspense> boundary. The page shell is a Server Component (no "use client"
// directive) that renders the Suspense wrapper. The form component is a
// separate Client Component that reads the search params.

import { Suspense } from "react";
import LoginForm from "./LoginForm";

// Static fallback shown while the client component hydrates.
// Matches the card dimensions so there is no layout shift.
function LoginFormFallback() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sign In</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back to LeadFlow AI CRM
        </p>
      </div>
      <div className="h-48 flex items-center justify-center text-sm text-gray-400">
        Loading…
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
