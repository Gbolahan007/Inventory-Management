import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Public routes that don't need authentication
  const publicRoutes = ["/login", "/signup", "/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If no session and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated
  if (session) {
    try {
      // Fetch user role
      const { data: userData, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return NextResponse.redirect(new URL("/login", request.url));
      }

      const userRole = userData?.role;

      // If no role found, redirect to login
      if (!userRole) {
        console.error("No role found for user:", session.user.id);
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // Handle redirect after login (only redirect if coming from login page)
      if (pathname === "/login") {
        if (userRole === "salesrep") {
          return NextResponse.redirect(
            new URL("/dashboard/sales", request.url)
          );
        } else if (userRole === "admin") {
          return NextResponse.redirect(
            new URL("/dashboard/inventory", request.url)
          );
        }
        // If role is neither admin nor salesrep, stay on login page
        return res;
      }

      // Role-based route protection
      const adminOnlyRoutes = [
        "/dashboard/inventory",
        "/dashboard/reports",
        "/admin",
      ];
      const salesrepRoutes = ["/dashboard/sales"];

      // Check admin routes
      if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
        if (userRole !== "admin") {
          const redirectPath =
            userRole === "salesrep" ? "/dashboard/sales" : "/login";
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      }

      // Check salesrep routes
      if (salesrepRoutes.some((route) => pathname.startsWith(route))) {
        if (userRole !== "salesrep" && userRole !== "admin") {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }
    } catch (error) {
      console.error("Error in middleware:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
