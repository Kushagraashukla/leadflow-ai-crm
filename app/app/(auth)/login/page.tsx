"use client";

// Login page — route: /login
// Client Component required for useActionState (React 19).
// The signIn logic runs entirely on the server via the Server Action.

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, type AuthActionResult } from "@/src/features/auth/actions/auth.actions";

export default function LoginPage() {
  // Read query params:
  //   ?next=    — original path the user tried to access before being redirected here
  //   ?message= — status message set by other auth flows (e.g. "check-email" after signup)
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const message = searchParams.get("message");

  const [state, action, pending] = useActionState<AuthActionResult | null, FormData>(
    signIn,
    null
  );

  // Map ?message= query params to user-facing banners.
  const infoMessage = (() => {
    if (message === "check-email")
      return "Account created! Check your email to verify before signing in.";
    if (message === "verification-failed")
      return "Email verification failed or link expired. Please try again.";
    return null;
  })();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      {/* Page heading */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sign In</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back to LeadFlow AI CRM
        </p>
      </div>

      {/* Info banner — shown after signup redirect or failed verification */}
      {infoMessage && (
        <div
          role="status"
          className="mb-4 rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700"
        >
          {infoMessage}
        </div>
      )}

      {/* Error banner — shown when signIn Server Action returns { success: false } */}
      {state && !state.success && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        {/*
          Hidden field: carries the ?next= path into the Server Action's FormData.
          signIn() reads this and redirects back to the originally requested URL
          instead of always going to /dashboard.
        */}
        <input type="hidden" name="next" value={next} />

        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            disabled={pending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={pending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Signing In…" : "Sign In"}
        </button>
      </form>

      {/* Link to signup */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
