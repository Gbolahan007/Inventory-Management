import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userRecord } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = userRecord?.role;

  // If trying to access /admin but not an admin
  if (req.nextUrl.pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // If sales trying to access anything other than /dashboard or /sales
  if (
    role === "sales" &&
    !["/dashboard", "/sales"].some((path) =>
      req.nextUrl.pathname.startsWith(path)
    )
  ) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return res;
}
