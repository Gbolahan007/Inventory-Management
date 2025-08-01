import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

// For general server-side operations (non-auth)
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// For client components - default export
export const supabase = createClientComponentClient();

// Other exports remain the same...
export const createSupabaseClient = () => createClientComponentClient();
export const createSupabaseServerClient = (cookies) =>
  createServerComponentClient({ cookies });
export const createSupabaseActionClient = (cookies) =>
  createServerActionClient({ cookies });
