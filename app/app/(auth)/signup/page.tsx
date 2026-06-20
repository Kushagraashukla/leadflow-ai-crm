"use client";

// Signup page — route: /signup
// Client Component required for useActionState (tracks Server Action state + pending).
// The actual signUp logic runs entirely on the server via the Server Action.

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthActionResult } from "@/src/features/auth/actions/auth.actions";

export default function SignupPage() {
  // useActionState wires the Server Action to the form:
  //   - `state`   — the last value returned by signUp() (null initially)
  //   - `action`  — the wrapped action to pass to <form action={...}>
  //   - `pending` — true while the Server Action is in-flight
  const [state, action, pending] = useActionState<AuthActionResult | null, FormData>(
    signUp,
    null
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      {/* Page heading */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create Account
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Start managing your leads with LeadFlow AI CRM
        </p>
      </div>

      {/*
        Error banner — shown when the Server Action returns { success: false }.
        Sits above the form so it's immediately visible.
      */}
      {state && !state.success && (
        <div
          role="alert"
          className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      {/*
        The `action` prop (not `onSubmit`) connects this form to the Server Action.
        FormData is serialized natively by the browser and sent to the server.
        This works without JavaScript (progressive enhancement) but also works
        with the pending state for a better UX when JS is available.
      */}
      <form action={action} className="space-y-4">
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
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            disabled={pending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
        </div>

        {/* Confirm password field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Re-enter your password"
            disabled={pending}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
        </div>

        {/* Submit button — shows loading state while action is pending */}
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Creating Account…" : "Create Account"}
        </button>
      </form>

      {/* Link to login */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-blue-600 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
