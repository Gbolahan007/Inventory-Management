// _lib/supabase.ts

import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

// For general server-side operations (non-auth)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// For client components
export const createSupabaseClient = () => createClientComponentClient();

// For server components
export const createSupabaseServerClient = (cookies) =>
  createServerComponentClient({ cookies });

// For server actions (like your login)
export const createSupabaseActionClient = (cookies) =>
  createServerActionClient({ cookies });
