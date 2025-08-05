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
  const initTimeoutRef = useRef<NodeJS.Timeout>();

  const isMounted = () => mountedRef.current;

  // Validate current session and handle expiration
  const validateSession = useCallback(async (): Promise<User | null> => {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Session validation timeout")), 8000);
      });

      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        timeoutPromise,
      ]);

      const session = sessionResult.data?.session;
      if (!session?.user) return null;

      const currentTime = Math.floor(Date.now() / 1000);
      if (session.expires_at && session.expires_at < currentTime) {
        const refreshResult = await Promise.race([
          supabase.auth.refreshSession(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Refresh timeout")), 5000)
          ),
        ]);

        if (refreshResult.error) return null;
        return refreshResult.data?.user || null;
      }

      return session.user;
    } catch {
      return null;
    }
  }, []);

  // Fetch user's role from the `users` table
  const fetchUserRole = useCallback(
    async (userId: string, retryCount = 0): Promise<UserRole> => {
      if (!userId || !isMounted()) return null;

      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Role fetch timeout")), 6000);
        });

        const { data, error } = await Promise.race([
          supabase.from("users").select("role").eq("id", userId).single(),
          timeoutPromise,
        ]);

        if (error) {
          if (
            retryCount === 0 &&
            (error.code === "PGRST301" ||
              error.message.includes("timeout") ||
              error.message.includes("connection"))
          ) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return fetchUserRole(userId, retryCount + 1);
          }
          throw error;
        }

        if (!data) throw new Error("No user profile found");
        return data.role as UserRole;
      } catch {
        return null;
      }
    },
    []
  );

  // Initialize authentication logic on mount
  const initializeAuth = useCallback(async () => {
    if (!isMounted()) return;

    try {
      setLoading(true);
      setError(null);

      const validatedUser = await validateSession();
      if (!isMounted()) return;

      if (validatedUser) {
        setUser(validatedUser);
        const role = await fetchUserRole(validatedUser.id);
        if (!isMounted()) return;
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
    } catch (error: any) {
      if (isMounted()) {
        setError(`Authentication failed: ${error.message}`);
        setUser(null);
        setUserRole(null);
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
        setIsInitialized(true);
      }
    }
  }, [validateSession, fetchUserRole]);

  const refreshAuth = useCallback(async () => {
    if (!isMounted()) return;
    setIsInitialized(false);
    await initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    mountedRef.current = true;
    initTimeoutRef.current = setTimeout(() => {
      if (loading && !isInitialized && isMounted()) {
        setLoading(false);
        setIsInitialized(true);
        setError("Authentication timeout. Please refresh the page.");
      }
    }, 15000);

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted()) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setUserRole(null);
        setError(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        const role = await fetchUserRole(session.user.id);
        if (isMounted()) {
          setUserRole(role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }

      if (isMounted()) setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      subscription.unsubscribe();
    };
  }, []);

  // Revalidate session periodically (every 5 min)
  useEffect(() => {
    if (!isInitialized || !user) return;

    const interval = setInterval(async () => {
      if (!isMounted() || !user) return;

      const validatedUser = await validateSession();
      if (!isMounted()) return;

      if (!validatedUser) {
        setUser(null);
        setUserRole(null);
        setError("Session expired. Please login again.");
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isInitialized, user, validateSession]);

  // Refresh auth when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && isInitialized && isMounted()) {
        refreshAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, isInitialized, refreshAuth]);

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
