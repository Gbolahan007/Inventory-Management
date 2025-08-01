"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/app/_lib/supabase";
import type { User } from "@supabase/supabase-js";

// Define allowed roles
type UserRole = "admin" | "salesrep" | null;

// Create a single instance that will be reused
const supabase = createSupabaseClient();

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 useAuth: Starting auth initialization...");
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First, try to get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log("📋 Initial session check:", {
          hasSession: !!session,
          sessionError: sessionError?.message,
          userId: session?.user?.id,
          email: session?.user?.email,
        });

        if (sessionError) {
          console.error("❌ Session error:", sessionError);
          if (mounted) {
            setError(sessionError.message);
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log("✅ User authenticated:", session.user.email);
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          if (mounted) {
            console.log("❌ No user session found");
            setUser(null);
            setUserRole(null);
            setLoading(false);
          }
        }
      } catch (error: any) {
        console.error("💥 Error in initializeAuth:", error);
        if (mounted) {
          setError(error.message);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.id);

      if (!mounted) return;

      try {
        if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          console.log("❌ No user session in state change");
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

    // Initialize auth after setting up the listener
    initializeAuth();

    return () => {
      console.log("🧹 Cleaning up auth subscription");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    if (!userId) {
      console.warn("No user ID provided");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("role, name, email")
        .eq("id", userId)
        .single();

      console.log("Fetched user data:", data);
      console.log("Error (if any):", error);

      if (error) {
        console.error("Database error:", error);
        setError(`Fetch error: ${error.message}`);
        setUserRole(null);
        return;
      }

      if (!data) {
        console.warn("No user profile found in database");
        setError("No user profile found");
        setUserRole(null);
        return;
      }

      setUserRole(data.role);
      setError(null);
    } catch (err: any) {
      console.error("Unexpected fetch error:", err);
      setUserRole(null);
      setError(`Failed to fetch user role: ${err.message}`);
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 Signing out user...");
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Sign out error:", error);
        setError(`Sign out failed: ${error.message}`);
        return;
      }

      setUser(null);
      setUserRole(null);
      setError(null);
      console.log("✅ Successfully signed out");
      router.push("/login");
    } catch (error: any) {
      console.error("💥 Error signing out:", error);
      setError(`Sign out error: ${error.message}`);
    }
  };

  const hasPermission = (requiredRole: UserRole) => {
    console.log("🔐 Checking permission:", { userRole, requiredRole });

    if (!userRole) return false;
    if (userRole === "admin") return true;
    if (userRole === "salesrep" && requiredRole === "salesrep") return true;
    return false;
  };

  console.log("🎯 useAuth current state:", {
    hasUser: !!user,
    userEmail: user?.email,
    userRole,
    loading,
    error,
    timestamp: new Date().toISOString(),
  });

  return {
    user,
    userRole,
    loading,
    error,
    signOut,
    hasPermission,
  };
};
