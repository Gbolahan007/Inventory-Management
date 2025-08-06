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

  // Create user record if it doesn't exist
  const createUserRecord = useCallback(
    async (userId: string, email: string): Promise<UserRole> => {
      try {
        console.log("Creating user record for:", userId);

        // Insert new user with default role (you can change this logic)
        const { data, error } = await supabase
          .from("users")
          .insert([
            {
              id: userId,
              email: email,
              role: "admin", // Set default role - change this as needed
              created_at: new Date().toISOString(),
            },
          ])
          .select("role")
          .single();

        if (error) {
          console.error("Error creating user record:", error);
          return "admin"; // Fallback role
        }

        console.log("User record created successfully:", data);
        return (data?.role as UserRole) || "admin";
      } catch (error) {
        console.error("Exception creating user record:", error);
        return "admin"; // Fallback role
      }
    },
    []
  );

  // Fetch user's role from the `users` table
  const fetchUserRole = useCallback(
    async (userId: string, email: string): Promise<UserRole> => {
      if (!userId || !isMounted()) return null;

      try {
        console.log("Fetching user role for:", userId);

        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);

          // If user doesn't exist (PGRST116), create them
          if (error.code === "PGRST116") {
            console.log("User not found, creating new user record...");
            return await createUserRecord(userId, email);
          }

          return "admin"; // Fallback role for other errors
        }

        console.log("User role fetched successfully:", data?.role);
        return (data?.role as UserRole) || "admin";
      } catch (error) {
        console.error("Exception fetching user role:", error);
        return "admin"; // Fallback role
      }
    },
    [createUserRecord]
  );

  // Initialize authentication - fixed version
  const initializeAuth = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initializingRef.current || !isMounted()) return;

    initializingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log("Initializing auth...");

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
        console.log("Session found for user:", session.user.id);
        setUser(session.user);

        // Fetch user role and wait for it to complete
        const role = await fetchUserRole(
          session.user.id,
          session.user.email || ""
        );
        if (isMounted()) {
          console.log("Setting user role:", role);
          setUserRole(role);
          // Only set loading to false after both user and role are set
          setLoading(false);
          setIsInitialized(true);
        }
      } else {
        console.log("No session found");
        setUser(null);
        setUserRole(null);
        // Set loading to false even if no user
        setLoading(false);
        setIsInitialized(true);
      }
    } catch (error: any) {
      console.error("Auth initialization error:", error);
      if (isMounted()) {
        setError(error.message || "Authentication failed");
        setUser(null);
        setUserRole(null);
        setLoading(false);
        setIsInitialized(true);
      }
    } finally {
      initializingRef.current = false;
    }
  }, [fetchUserRole]);

  // Handle auth state changes
  const handleAuthStateChange = useCallback(
    async (event: string, session: any) => {
      if (!isMounted()) return;

      console.log("Auth state change:", event);

      // Set loading to true for state changes that require role fetching
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setLoading(true);
        setIsInitialized(false);
      }

      switch (event) {
        case "SIGNED_OUT":
          console.log("User signed out");
          setUser(null);
          setUserRole(null);
          setError(null);
          setLoading(false);
          setIsInitialized(true);
          break;

        case "SIGNED_IN":
        case "TOKEN_REFRESHED":
          if (session?.user) {
            console.log("User signed in:", session.user.id);
            setUser(session.user);
            const role = await fetchUserRole(
              session.user.id,
              session.user.email || ""
            );
            if (isMounted()) {
              console.log("Setting user role after sign in:", role);
              setUserRole(role);
              setLoading(false);
              setIsInitialized(true);
            }
          } else {
            setLoading(false);
            setIsInitialized(true);
          }
          break;

        default:
          // Don't change loading state for other events
          break;
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
        console.warn("Auth initialization timeout");
        setLoading(false);
        setIsInitialized(true);
        setError("Authentication timeout. Please refresh the page.");
      }
    }, 15000); // Increased timeout

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  // Check permission for a specific role
  const hasPermission = useCallback(
    (requiredRole: UserRole) => {
      console.log("Checking permission:", {
        userRole,
        requiredRole,
        isInitialized,
      });
      if (!userRole || !isInitialized) return false;
      if (userRole === "admin") return true;
      if (userRole === "salesrep" && requiredRole === "salesrep") return true;
      return false;
    },
    [userRole, isInitialized]
  );

  // Manual refresh function
  const refreshAuth = useCallback(() => {
    if (!isMounted()) return;
    setIsInitialized(false);
    initializeAuth();
  }, [initializeAuth]);

  // Debug log current state
  useEffect(() => {
    console.log("Auth State:", {
      user: !!user,
      userRole,
      loading,
      isInitialized,
      error,
    });
  }, [user, userRole, loading, isInitialized, error]);

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
