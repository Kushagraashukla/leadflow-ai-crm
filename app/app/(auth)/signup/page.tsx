// Signup page — route: /signup
// Server Component (no 'use client' directive).
// Authentication logic (Server Action + form submission) added in next milestone.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account | LeadFlow AI CRM",
  description: "Create a new LeadFlow AI CRM account",
};

export default function SignupPage() {
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
        Form placeholder — authentication logic (signUp Server Action,
        validation, error handling, email verification notice) will be
        wired up in the next milestone.
      */}
      <form className="space-y-4">
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
            placeholder="you@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit — disabled until Server Action is wired up */}
        <button
          type="submit"
          disabled
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md opacity-50 cursor-not-allowed"
        >
          Create Account
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
