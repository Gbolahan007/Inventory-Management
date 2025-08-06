/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { supabase } from "@/app/_lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

type UserRole = "admin" | "salesrep" | null;

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  const isMounted = () => mountedRef.current;

  // Fetch user's role from the `users` table
  const fetchUserRole = useCallback(
    async (userId: string): Promise<UserRole> => {
      if (!userId || !isMounted()) return null;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          return null;
        }

        return (data?.role as UserRole) || null;
      } catch (error) {
        console.error("Exception fetching user role:", error);
        return null;
      }
    },
    []
  );

  // Initialize authentication - simplified version
  const initializeAuth = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initializingRef.current || !isMounted()) return;

    initializingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!isMounted()) return;

      if (session?.user) {
        setUser(session.user);

        // Fetch user role
        const role = await fetchUserRole(session.user.id);
        if (isMounted()) {
          setUserRole(role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
    } catch (error: any) {
      console.error("Auth initialization error:", error);
      if (isMounted()) {
        setError(error.message || "Authentication failed");
        setUser(null);
        setUserRole(null);
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
        setIsInitialized(true);
      }
      initializingRef.current = false;
    }
  }, [fetchUserRole]);

  // Handle auth state changes
  const handleAuthStateChange = useCallback(
    async (event: string, session: any) => {
      if (!isMounted()) return;

      console.log("Auth state change:", event);

      switch (event) {
        case "SIGNED_OUT":
          setUser(null);
          setUserRole(null);
          setError(null);
          break;

        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          if (session?.user) {
            setUser(session.user);
            const role = await fetchUserRole(session.user.id);
            if (isMounted()) {
              setUserRole(role);
            }
          }
          break;

        default:
          // Handle other events if needed
          break;
      }

      if (isMounted()) {
        setLoading(false);
      }
    },
    [fetchUserRole]
  );

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true;

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initialize auth
    initializeAuth();

    // Cleanup timeout for initialization
    const initTimeout = setTimeout(() => {
      if (loading && !isInitialized && isMounted()) {
        setLoading(false);
        setIsInitialized(true);
        setError("Authentication timeout. Please refresh the page.");
      }
    }, 10000); // Reduced to 10 seconds

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  // Check permission for a specific role
  const hasPermission = useCallback(
    (requiredRole: UserRole) => {
      if (!userRole || !isInitialized) return false;
      if (userRole === "admin") return true;
      if (userRole === "salesrep" && requiredRole === "salesrep") return true;
      return false;
    },
    [userRole, isInitialized]
  );

  // Manual refresh function (simplified)
  const refreshAuth = useCallback(() => {
    if (!isMounted()) return;
    setIsInitialized(false);
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    userRole,
    loading,
    error,
    isInitialized,
    hasPermission,
    refreshAuth,
  };
};
