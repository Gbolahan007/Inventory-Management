// app/_lib/supabase-server.js
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// For server components that need user context
export const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient({
    cookies: () => cookieStore,
  });
};

// For server actions that need user context
export const createSupabaseActionClient = () => {
  const cookieStore = cookies();
  return createServerActionClient({
    cookies: () => cookieStore,
  });
};

// For API routes that need user context
export const createSupabaseRouteHandlerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient({
    cookies: () => cookieStore,
  });
};
