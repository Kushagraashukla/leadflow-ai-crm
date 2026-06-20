// Email verification callback route — /api/auth/callback
//
// Supabase sends users here after they click the email verification link.
// The URL contains a one-time PKCE `code` query parameter.
//
// This handler:
//   1. Reads the `code` from the query string
//   2. Exchanges it for a Supabase session (sets the session cookie)
//   3. Redirects the authenticated user to /dashboard
//   4. On failure, redirects to /login with an error message

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // The PKCE authorization code sent by Supabase in the email link.
  const code = searchParams.get("code");

  // Optional: where to send the user after successful verification.
  // Defaults to /dashboard if not provided.
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();

    // exchangeCodeForSession:
    //   - Validates the PKCE code against the Supabase server
    //   - Writes the access token + refresh token into httpOnly cookies
    //   - The user is now authenticated for all subsequent requests
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Session established — send the user to the dashboard.
      // Using `origin` ensures the redirect works in both local dev and production.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Code was missing or the exchange failed (expired, already used, etc.)
  // Redirect to login with an error message the page can display.
  return NextResponse.redirect(
    `${origin}/login?message=verification-failed`
  );
}
