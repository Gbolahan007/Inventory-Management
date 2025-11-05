/* eslint-disable @typescript-eslint/no-explicit-any */

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  //  Get the user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  //  Public routes (accessible without login)
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.includes(pathname);

  //  If user is not logged in and tries to access protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in
  if (session) {
    let userRole =
      session.user.user_metadata?.role || session.user.app_metadata?.role;

    // If role not found in auth metadata, get it from the "users" table
    if (!userRole) {
      try {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (userData?.role) {
          userRole = userData.role;

          // Cache role in user metadata
          supabase.auth
            .updateUser({
              data: { role: userData.role },
            })
            .catch((err) =>
              console.error("Error updating user metadata:", err)
            );
        } else {
          console.error("No role found for user:", session.user.id);
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL("/login", request.url));
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        userRole = "unknown";
      }
    }

    //  Redirect users to their dashboard after login based on role
    if (pathname === "/login" && userRole && userRole !== "unknown") {
      if (userRole === "salesrep") {
        return NextResponse.redirect(new URL("/dashboard/sales", request.url));
      } else if (userRole === "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else if (userRole === "secretary") {
        return NextResponse.redirect(new URL("/dashboard/room", request.url));
      }
      return response;
    }

    //  Role-based route access control
    if (userRole && userRole !== "unknown") {
      // Define route groups
      const adminOnlyRoutes = [
        "/dashboard/inventory",
        "/dashboard/reports",
        "/admin",
      ];

      const salesrepRoutes = ["/dashboard/sales"];
      const secretaryRoutes = ["/dashboard/room"];

      // --- Admin route protection ---
      if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
        if (userRole !== "admin") {
          let redirectPath = "/login";

          if (userRole === "salesrep") redirectPath = "/dashboard/sales";
          else if (userRole === "secretary") redirectPath = "/dashboard/room";

          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      }

      // --- Salesrep route protection ---
      if (salesrepRoutes.some((route) => pathname.startsWith(route))) {
        if (userRole !== "salesrep" && userRole !== "admin") {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }

      // --- Secretary route protection ---
      if (secretaryRoutes.some((route) => pathname.startsWith(route))) {
        if (userRole !== "secretary" && userRole !== "admin") {
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }
    }
  }

  return response;
}

//  Middleware will only run on protected routes
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
