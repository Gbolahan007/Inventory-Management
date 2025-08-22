/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { supabase } from "@/app/_lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";

type UserRole = "admin" | "salesrep" | null;

// Extended user data type
type UserData = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const mountedRef = useRef(true);
  const initializingRef = useRef(false);

  const isMounted = () => mountedRef.current;

  // Create user record if it doesn't exist
  const createUserRecord = useCallback(
    async (userId: string, email: string): Promise<UserData> => {
      try {
        console.log("Creating user record for:", userId);

        // Extract name from email (basic fallback) or use display name from auth
        const defaultName = email.split("@")[0] || "User";

        // Insert new user with default role and extracted name
        const { data, error } = await supabase
          .from("users")
          .insert([
            {
              id: userId,
              email: email,
              name: defaultName, // You can improve this logic
              role: "admin", // Set default role - change this as needed
              created_at: new Date().toISOString(),
            },
          ])
          .select("id, email, name, role")
          .single();

        if (error) {
          console.error("Error creating user record:", error);
          // Return fallback user data
          return {
            id: userId,
            email: email,
            name: defaultName,
            role: "admin",
          };
        }

        console.log("User record created successfully:", data);
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: (data.role as UserRole) || "admin",
        };
      } catch (error) {
        console.error("Exception creating user record:", error);
        // Return fallback user data
        return {
          id: userId,
          email: email,
          name: email.split("@")[0] || "User",
          role: "admin",
        };
      }
    },
    []
  );

  // Fetch user's data from the `users` table
  const fetchUserData = useCallback(
    async (userId: string, email: string): Promise<UserData | null> => {
      if (!userId || !isMounted()) return null;

      try {
        console.log("Fetching user data for:", userId);

        const { data, error } = await supabase
          .from("users")
          .select("id, email, name, role")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);

          // If user doesn't exist (PGRST116), create them
          if (error.code === "PGRST116") {
            console.log("User not found, creating new user record...");
            return await createUserRecord(userId, email);
          }

          // Return fallback for other errors
          return {
            id: userId,
            email: email,
            name: email.split("@")[0] || "User",
            role: "admin",
          };
        }

        console.log("User data fetched successfully:", data);
        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: (data.role as UserRole) || "admin",
        };
      } catch (error) {
        console.error("Exception fetching user data:", error);
        return {
          id: userId,
          email: email,
          name: email.split("@")[0] || "User",
          role: "admin",
        };
      }
    },
    [createUserRecord]
  );

  // Initialize authentication - enhanced version
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

        // Fetch complete user data and wait for it to complete
        const data = await fetchUserData(
          session.user.id,
          session.user.email || ""
        );

        if (isMounted() && data) {
          console.log("Setting user data:", data);
          setUserData(data);
          setUserRole(data.role);
          // Only set loading to false after all data is set
          setLoading(false);
          setIsInitialized(true);
        }
      } else {
        console.log("No session found");
        setUser(null);
        setUserData(null);
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
        setUserData(null);
        setUserRole(null);
        setLoading(false);
        setIsInitialized(true);
      }
    } finally {
      initializingRef.current = false;
    }
  }, [fetchUserData]);

  // Handle auth state changes
  const handleAuthStateChange = useCallback(
    async (event: string, session: any) => {
      if (!isMounted()) return;

      console.log("Auth state change:", event);

      // Set loading to true for state changes that require data fetching
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setLoading(true);
        setIsInitialized(false);
      }

      switch (event) {
        case "SIGNED_OUT":
          console.log("User signed out");
          setUser(null);
          setUserData(null);
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
            const data = await fetchUserData(
              session.user.id,
              session.user.email || ""
            );
            if (isMounted() && data) {
              console.log("Setting user data after sign in:", data);
              setUserData(data);
              setUserRole(data.role);
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
    [fetchUserData]
  );

  // Update user name function
  const updateUserName = useCallback(
    async (newName: string): Promise<boolean> => {
      if (!user || !userData) return false;

      try {
        const { error } = await supabase
          .from("users")
          .update({ name: newName })
          .eq("id", user.id);

        if (error) {
          console.error("Error updating user name:", error);
          return false;
        }

        // Update local state
        setUserData((prev) => (prev ? { ...prev, name: newName } : null));
        return true;
      } catch (error) {
        console.error("Exception updating user name:", error);
        return false;
      }
    },
    [user, userData]
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

  return {
    user,
    userData, // Now includes name, email, role, id
    userRole,
    userName: userData?.name || null, // Quick access to name
    loading,
    error,
    isInitialized,
    hasPermission,
    refreshAuth,
    updateUserName, // Function to update the name
  };
};
