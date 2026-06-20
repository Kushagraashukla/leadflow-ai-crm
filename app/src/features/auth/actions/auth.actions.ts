"use server";

// Server Actions for authentication.
// 'use server' directive marks every exported function in this file as a Server Action.
// These run exclusively on the server — credentials never leave the server boundary.

import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

// Returned by auth actions on failure so Client Components can display inline errors.
export type AuthActionResult =
  | { success: true }
  | { success: false; error: string };

// ─── signUp ───────────────────────────────────────────────────────────────────

/**
 * Registers a new user via Supabase Auth.
 *
 * Called by the SignupForm Client Component when the form is submitted.
 * On success: redirects the user to a confirmation page.
 * On failure: returns a typed error object the form can display inline.
 *
 * @param _prevState - Previous action state (required by useActionState hook).
 * @param formData   - FormData submitted from the signup form.
 */
export async function signUp(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  // Extract and validate fields from FormData.
  // Using FormData (not JSON body) keeps this compatible with progressive enhancement.
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  // ── Field presence check ──────────────────────────────────────────────────
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return { success: false, error: "All fields are required." };
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  // ── Email format check ────────────────────────────────────────────────────
  if (!trimmedEmail || !trimmedEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  // ── Password length check ─────────────────────────────────────────────────
  // Supabase minimum is 6 characters; we enforce 8 for slightly better security.
  if (trimmedPassword.length < 8) {
    return {
      success: false,
      error: "Password must be at least 8 characters long.",
    };
  }

  // ── Password match check ──────────────────────────────────────────────────
  if (trimmedPassword !== confirmPassword.trim()) {
    return { success: false, error: "Passwords do not match." };
  }

  // ── Supabase sign-up ──────────────────────────────────────────────────────
  // createClient() is async because it awaits cookies() from next/headers.
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password: trimmedPassword,
    options: {
      // Supabase will append ?code=<pkce_code> to this URL when the user
      // clicks the verification link in their email.
      // This route handler exchanges the code for a session cookie.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  });

  // ── Handle Supabase errors ────────────────────────────────────────────────
  if (error) {
    // Map common Supabase error messages to user-friendly strings.
    if (error.message.includes("already registered")) {
      return {
        success: false,
        error: "An account with this email already exists. Try signing in.",
      };
    }
    // Fallback for unexpected errors — don't expose raw Supabase internals.
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }

  // ── Success: redirect to confirmation notice ──────────────────────────────
  // redirect() throws a special Next.js error that aborts the action and
  // redirects the browser. It must be called OUTSIDE try/catch blocks.
  // We redirect to a query-param route so the login page can show a notice.
  redirect("/login?message=check-email");
}

// ─── signIn ───────────────────────────────────────────────────────────────────

/**
 * Signs in an existing user with email and password.
 *
 * On success: redirects to /dashboard (or the ?next= path if provided).
 * On failure: returns a typed error the LoginForm can display inline.
 *
 * @param _prevState - Required by useActionState.
 * @param formData   - FormData from the login form.
 */
export async function signIn(
  _prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email");
  const password = formData.get("password");
  const next = formData.get("next");

  // ── Field presence check ──────────────────────────────────────────────────
  if (typeof email !== "string" || typeof password !== "string") {
    return { success: false, error: "Email and password are required." };
  }

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedEmail.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  if (!trimmedPassword) {
    return { success: false, error: "Password is required." };
  }

  // ── Supabase sign-in ──────────────────────────────────────────────────────
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password: trimmedPassword,
  });

  // ── Handle Supabase errors ────────────────────────────────────────────────
  if (error) {
    // Supabase returns "Invalid login credentials" for wrong email or password.
    // We deliberately keep the message vague to prevent user enumeration.
    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("invalid_credentials")
    ) {
      return {
        success: false,
        error: "Incorrect email or password. Please try again.",
      };
    }

    if (error.message.includes("Email not confirmed")) {
      return {
        success: false,
        error: "Please verify your email before signing in.",
      };
    }

    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }

  // ── Success: redirect to dashboard (or the originally requested path) ─────
  // If the middleware set a ?next= param, respect it; otherwise go to /dashboard.
  const redirectTo =
    typeof next === "string" && next.startsWith("/") ? next : "/dashboard";

  redirect(redirectTo);
}

// ─── signOut ──────────────────────────────────────────────────────────────────

/**
 * Signs out the current user and clears the session cookie.
 *
 * Called from the LogoutButton in the dashboard layout.
 * Always redirects to /login after sign-out, regardless of errors.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();

  // signOut() clears the session on Supabase's server AND removes the
  // local session cookie via the SSR cookie helpers.
  await supabase.auth.signOut();

  // Redirect to login. redirect() is called outside try/catch intentionally.
  redirect("/login");
}
