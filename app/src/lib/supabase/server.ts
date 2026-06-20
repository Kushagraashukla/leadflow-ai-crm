import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client.
 *
 * Use this in:
 *   - Server Components
 *   - Route Handlers (app/api/[...]/route.ts)
 *   - Server Actions ('use server')
 *   - Middleware (middleware.ts)
 *
 * Reads the session from the incoming request cookie and writes
 * refreshed tokens back to the response cookie automatically.
 *
 * Do NOT use this in Client Components ('use client') —
 * use the browser client from ./client.ts for those contexts.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component where cookies cannot
            // be set. This is safe to ignore — the middleware will handle
            // token refresh and cookie writing on the next request.
          }
        },
      },
    }
  );
}
