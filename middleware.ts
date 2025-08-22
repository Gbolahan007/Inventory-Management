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
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If no session and trying to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated
  if (session) {
    let userRole =
      session.user.user_metadata?.role || session.user.app_metadata?.role;

    if (!userRole) {
      try {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userData?.role) {
          userRole = userData.role;

          supabase.auth
            .updateUser({
              data: { role: userData.role },
            })
            .catch((err) =>
              console.error("Error updating user metadata:", err)
            );
        } else {
          // Only redirect to login if we really can't find a role
          console.error("No role found for user:", session.user.id);
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/login", request.url));
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        userRole = "unknown";
      }
    }

    // Handle redirect after login - but ONLY if we have a role
    if (pathname === "/login" && userRole && userRole !== "unknown") {
      if (userRole === "salesrep") {
        return NextResponse.redirect(new URL("/dashboard/sales", request.url));
      } else if (userRole === "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      // If role is neither admin nor salesrep, stay on login page
      return res;
    }

    // Don't enforce role-based protection if role is unknown (prevents loops)
    if (userRole && userRole !== "unknown") {
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
    }
  }

  return res;
}

// More restrictive matcher - only run on protected routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
