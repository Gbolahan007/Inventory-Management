// app/_lib/supabase.js
import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

// Singleton pattern for client-side Supabase instance
let supabaseClientInstance = null;

// For client components - use singleton pattern
export const supabase = (() => {
  if (typeof window === "undefined") {
    // Server-side: always create new instance
    return createClientComponentClient();
  }

  // Client-side: use singleton
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClientComponentClient();
  }
  return supabaseClientInstance;
})();

// For general server-side operations (non-auth)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Factory functions - these should create new instances when called
export const createSupabaseClient = () => {
  if (typeof window === "undefined") {
    return createClientComponentClient();
  }
  // Return the singleton instance for client-side
  return supabase;
};

export const createSupabaseServerClient = (cookies) =>
  createServerComponentClient({ cookies });

export const createSupabaseActionClient = (cookies) =>
  createServerActionClient({ cookies });
