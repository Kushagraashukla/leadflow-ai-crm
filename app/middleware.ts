import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js Edge Middleware — runs before every matched request.
 *
 * Responsibilities:
 *   1. Refresh the Supabase session (prevents stale JWTs from causing logouts)
 *   2. Protect /dashboard routes — redirect unauthenticated users to /login
 *   3. Redirect already-authenticated users away from /login and /signup
 *
 * Why middleware instead of layout.tsx for the session check?
 *   - Middleware runs at the edge, before React renders anything.
 *   - layout.tsx runs after routing is decided — a flash of protected content
 *     is possible if you only guard in the layout.
 *   - Middleware is the canonical Next.js + Supabase recommendation.
 */
export async function middleware(request: NextRequest) {
  // Start with a response that passes the request through unchanged.
  // We may modify it below (to set refreshed cookie values).
  let supabaseResponse = NextResponse.next({ request });

  // Build the server client inside middleware.
  // Unlike the server.ts utility, middleware cannot use next/headers —
  // it must read/write cookies directly from the request and response objects.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          // Read all cookies from the incoming request.
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Step 1: Write to the request object (for downstream server code).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Step 2: Rebuild the response so the refreshed cookies are
          // included in the outgoing Set-Cookie headers.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() validates the JWT with Supabase's server.
  // Never use getSession() here — it only reads the local cookie without
  // server validation, making it spoofable.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Route protection rules ─────────────────────────────────────────────────

  // Rule 1: Unauthenticated user trying to access a protected route.
  // Redirect to /login, preserving the originally requested path in `?next=`
  // so we can send them back after a successful login.
  if (!user && pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rule 2: Authenticated user trying to access auth pages.
  // Redirect to /dashboard — no point showing login/signup to a logged-in user.
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  // All other cases: pass the request through, returning the (possibly
  // cookie-updated) response so refreshed tokens reach the browser.
  return supabaseResponse;
}

// ── Matcher config ─────────────────────────────────────────────────────────────
// Tells Next.js which paths to run middleware on.
// Excludes _next internals, static files, and common asset extensions
// to avoid unnecessary edge invocations on every image or font request.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
