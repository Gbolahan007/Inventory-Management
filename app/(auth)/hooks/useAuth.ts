/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { createSupabaseClient } from "@/app/_lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserRole = "admin" | "salesrep" | null;

export const useAuth = () => {
  // State variables for user, role, loading status, and errors
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get the client-side Supabase instance
  const supabase = createSupabaseClient();

  useEffect(() => {
    let mounted = true;

    // Initializes authentication state on mount
    const initializeAuth = async () => {
      try {
        // Get the current session from Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("❌ Session error:", sessionError);
          if (mounted) {
            setError(sessionError.message);
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else if (mounted) {
          console.log("❌ No user session found");
          setUser(null);
          setUserRole(null);
          setLoading(false);
        }
      } catch (error: any) {
        console.error("💥 Error in initializeAuth:", error);
        if (mounted) {
          setError(error.message);
          setLoading(false);
        }
      }
    };

    // Listen to auth state changes (e.g., login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error: any) {
        console.error("💥 Error in auth state change:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    });

    // Initialize auth on mount
    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user role from your database
  const fetchUserRole = async (userId: string) => {
    if (!userId) {
      console.warn("No user ID provided");
      return;
    }

    try {
      // Validate user identity
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setError(`Auth error: ${userError.message}`);
        return;
      }

      if (!currentUser || currentUser.id !== userId) {
        setError("User authentication mismatch");
        return;
      }

      // Query user role from `users` table
      const { data, error } = await supabase
        .from("users")
        .select("role, name, email")
        .eq("id", userId)
        .single();

      if (error) {
        if (
          error.code === "PGRST116" ||
          error.message.includes("row-level security")
        ) {
          setError("Access denied: Check database permissions");
        } else {
          setError(`Database error: ${error.message}`);
        }
        setUserRole(null);
        return;
      }

      if (!data) {
        setError("No user profile found in database");
        setUserRole(null);
        return;
      }

      // Set role in local state
      setUserRole(data.role);
      setError(null);
    } catch (err: any) {
      console.error("Unexpected fetch error:", err);
      setUserRole(null);
      setError(`Failed to fetch user role: ${err.message}`);
    }
  };

  // Signs the user out and clears local state
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(`Sign out failed: ${error.message}`);
        return;
      }

      setUser(null);
      setUserRole(null);
      setError(null);
      console.log("✅ Successfully signed out");
      router.push("/login"); // Navigate to login page
    } catch (error: any) {
      console.error("💥 Error signing out:", error);
      setError(`Sign out error: ${error.message}`);
    }
  };

  // Check if user has the required role
  const hasPermission = (requiredRole: UserRole) => {
    if (!userRole) return false;
    if (userRole === "admin") return true;
    if (userRole === "salesrep" && requiredRole === "salesrep") return true;
    return false;
  };

  return {
    user,
    userRole,
    loading,
    error,
    signOut,
    hasPermission,
  };
};
