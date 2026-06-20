import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client.
 *
 * Use this inside Client Components ('use client') only.
 * Reads and writes the session from cookies managed by the browser.
 *
 * Do NOT use this in Server Components, Route Handlers, or Middleware —
 * use the server client from ./server.ts for those contexts.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
