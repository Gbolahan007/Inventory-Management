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
        const defaultName = email.split("@")[0] || "User";

        const { data, error } = await supabase
          .from("users")
          .insert([
            {
              id: userId,
              email: email,
              name: defaultName,
              role: "admin",
              created_at: new Date().toISOString(),
            },
          ])
          .select("id, email, name, role")
          .single();

        if (error) {
          return {
            id: userId,
            email: email,
            name: defaultName,
            role: "admin",
          };
        }

        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: (data.role as UserRole) || "admin",
        };
      } catch {
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
        const { data, error } = await supabase
          .from("users")
          .select("id, email, name, role")
          .eq("id", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            return await createUserRecord(userId, email);
          }

          return {
            id: userId,
            email: email,
            name: email.split("@")[0] || "User",
            role: "admin",
          };
        }

        return {
          id: data.id,
          email: data.email,
          name: data.name,
          role: (data.role as UserRole) || "admin",
        };
      } catch {
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

  // Initialize authentication
  const initializeAuth = useCallback(async () => {
    if (initializingRef.current || !isMounted()) return;

    initializingRef.current = true;
    setLoading(true);
    setError(null);

    try {
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

        const data = await fetchUserData(
          session.user.id,
          session.user.email || ""
        );

        if (isMounted() && data) {
          setUserData(data);
          setUserRole(data.role);
          setLoading(false);
          setIsInitialized(true);
        }
      } else {
        setUser(null);
        setUserData(null);
        setUserRole(null);
        setLoading(false);
        setIsInitialized(true);
      }
    } catch (initError: any) {
      if (isMounted()) {
        setError(initError.message || "Authentication failed");
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

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setLoading(true);
        setIsInitialized(false);
      }

      switch (event) {
        case "SIGNED_OUT":
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
            setUser(session.user);
            const data = await fetchUserData(
              session.user.id,
              session.user.email || ""
            );
            if (isMounted() && data) {
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
          return false;
        }

        setUserData((prev) => (prev ? { ...prev, name: newName } : null));
        return true;
      } catch {
        return false;
      }
    },
    [user, userData]
  );

  // Initialize on mount
  useEffect(() => {
    mountedRef.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    initializeAuth();

    const initTimeout = setTimeout(() => {
      if (loading && !isInitialized && isMounted()) {
        setLoading(false);
        setIsInitialized(true);
        setError("Authentication timeout. Please refresh the page.");
      }
    }, 15000);

    return () => {
      mountedRef.current = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []);

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

  // Manual refresh function
  const refreshAuth = useCallback(() => {
    if (!isMounted()) return;
    setIsInitialized(false);
    initializeAuth();
  }, [initializeAuth]);

  return {
    user,
    userData,
    userRole,
    userName: userData?.name || null,
    loading,
    error,
    isInitialized,
    hasPermission,
    refreshAuth,
    updateUserName,
  };
};
