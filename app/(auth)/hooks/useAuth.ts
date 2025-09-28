/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { supabase } from "@/app/_lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// ---------- TYPES ----------
type UserRole = "admin" | "salesrep" | null;

type UserData = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

// ---------- HELPER ----------
function mapRole(role: any): UserRole {
  return role === "admin" || role === "salesrep" ? role : "admin";
}

// ---------- HOOK ----------
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // Prevent excessive calls but allow retries when needed
  const lastInitTime = useRef<number>(0);
  const initializingRef = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // ---------- CREATE USER RECORD ----------
  const createUserRecord = useCallback(
    async (userId: string, email: string): Promise<UserData> => {
      const defaultName = email.split("@")[0] || "User";
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            id: userId,
            email,
            name: defaultName,
            role: "admin",
            created_at: new Date().toISOString(),
          },
        ])
        .select("id, email, name, role")
        .single();

      if (error) {
        return { id: userId, email, name: defaultName, role: "admin" };
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: mapRole(data.role),
      };
    },
    []
  );

  // ---------- FETCH USER DATA ----------
  const fetchUserData = useCallback(
    async (userId: string, email: string): Promise<UserData> => {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, name, role")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return await createUserRecord(userId, email);
        }
        return { id: userId, email, name: email.split("@")[0], role: "admin" };
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: mapRole(data.role),
      };
    },
    [createUserRecord]
  );

  // ---------- INITIALIZE AUTH ----------
  const initializeAuth = useCallback(
    async (forceRefresh = false) => {
      const now = Date.now();

      // Rate limit: don't allow calls more frequent than every 2 seconds unless forced
      if (!forceRefresh && now - lastInitTime.current < 2000) {
        return;
      }

      // Prevent concurrent calls
      if (initializingRef.current) {
        return;
      }

      // Retry logic - if we've failed too many times, wait longer
      if (retryCount.current >= maxRetries && !forceRefresh) {
        return;
      }

      initializingRef.current = true;
      lastInitTime.current = now;

      setLoading(true);
      setError(null);

      try {
        const {
          data: { user: verifiedUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!verifiedUser) {
          setUser(null);
          setUserData(null);
          setUserRole(null);
          retryCount.current = 0; // Reset retry count on clear state
          if (pathname !== "/login") {
            router.replace("/login");
          }
          return;
        }

        setUser(verifiedUser);

        const profile = await fetchUserData(
          verifiedUser.id,
          verifiedUser.email || ""
        );

        if (profile) {
          setUserData(profile);
          setUserRole(profile.role);
          retryCount.current = 0; // Reset on success
        }
      } catch (err: any) {
        retryCount.current++;
        setError(err.message || "Authentication failed");

        // Only clear state and redirect on persistent failures
        if (retryCount.current >= maxRetries) {
          setUser(null);
          setUserData(null);
          setUserRole(null);
          if (pathname !== "/login") {
            router.replace("/login");
          }
        }
      } finally {
        setLoading(false);
        setIsInitialized(true);
        initializingRef.current = false;
      }
    },
    [fetchUserData, router, pathname]
  );

  // ---------- SUBSCRIBE TO AUTH STATE ----------
  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;

      // Reset retry count on auth events
      retryCount.current = 0;

      // Always reinitialize on auth changes - this ensures data reliability
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED"
      ) {
        initializeAuth(true); // Force refresh on auth events
      }
    });

    // Initial auth check
    if (!isInitialized) {
      initializeAuth(true);
    }

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []); // Removed dependencies to prevent re-subscription

  // ---------- ROUTE CHANGE HANDLING ----------
  useEffect(() => {
    // Only reinitialize on route change if we have stale/missing data
    if (isInitialized && !loading) {
      const needsRefresh = !user || !userData || error;

      if (needsRefresh) {
        initializeAuth(true);
      }
    }
  }, [pathname]); // Only depend on pathname

  // ---------- WINDOW FOCUS RECOVERY ----------
  useEffect(() => {
    const handleFocus = () => {
      // Only refresh on focus if we have missing data or errors
      if (isInitialized && (!user || !userData || error)) {
        initializeAuth(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isInitialized, user, userData, error, initializeAuth]);

  // ---------- PERIODIC HEALTH CHECK ----------
  useEffect(() => {
    if (!isInitialized || loading) return;

    const healthCheck = setInterval(() => {
      // Check if we should have data but don't
      if (user && !userData) {
        initializeAuth(true);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(healthCheck);
  }, [isInitialized, loading, user, userData, initializeAuth]);

  return {
    user,
    userData,
    userRole,
    loading,
    error,
    isInitialized,
    hasPermission: (r: UserRole) =>
      userRole === "admin" || (userRole === "salesrep" && r === "salesrep"),
    // Expose manual refresh for debugging
    refreshAuth: () => initializeAuth(true),
  };
};
