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

  // Prevent multiple simultaneous auth initializations
  const initializingRef = useRef(false);
  const lastPathRef = useRef<string | null>(null);

  const log = (label: string, data?: any) => {
    console.log(`[AuthDebug ${new Date().toISOString()}] ${label}`, data || "");
  };

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
        log("Failed to create user record", error.message);
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
          log("User not found, creating new record");
          return await createUserRecord(userId, email);
        }
        log("Failed to fetch user data", error.message);
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
  const initializeAuth = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (initializingRef.current) {
      log("Auth initialization already in progress, skipping");
      return;
    }

    initializingRef.current = true;
    log("Initializing auth...");

    // Only set loading to true if we're not already initialized
    if (!isInitialized) {
      setLoading(true);
    }
    setError(null);

    try {
      const {
        data: { user: verifiedUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!verifiedUser) {
        log("No verified user found — redirecting to /login");
        // Only update state if values actually changed
        if (user !== null || userData !== null || userRole !== null) {
          setUser(null);
          setUserData(null);
          setUserRole(null);
        }
        router.replace("/login");
        return;
      }

      log("Verified user", { id: verifiedUser.id, email: verifiedUser.email });

      // Only update user state if it actually changed
      if (!user || user.id !== verifiedUser.id) {
        setUser(verifiedUser);
      }

      const profile = await fetchUserData(
        verifiedUser.id,
        verifiedUser.email || ""
      );

      if (profile) {
        log("Loaded user profile", profile);
        // Only update state if values actually changed
        if (
          !userData ||
          userData.id !== profile.id ||
          userData.email !== profile.email ||
          userData.name !== profile.name ||
          userData.role !== profile.role
        ) {
          setUserData(profile);
          setUserRole(profile.role);
        }
      }
    } catch (err: any) {
      log("Auth init error", err.message);
      setError(err.message || "Authentication failed");
      if (user !== null || userData !== null || userRole !== null) {
        setUser(null);
        setUserData(null);
        setUserRole(null);
      }
      router.replace("/login");
    } finally {
      setLoading(false);
      if (!isInitialized) {
        setIsInitialized(true);
        log("Auth init complete", { isInitialized: true });
      }
      initializingRef.current = false;
    }
  }, [fetchUserData, router, user, userData, userRole, isInitialized]);

  // ---------- SUBSCRIBE TO AUTH STATE ----------
  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;

      log(`Auth state change: ${event}`);
      // Only reinitialize on actual auth changes, not on every event
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED"
      ) {
        initializeAuth();
      }
    });

    // Initial auth check - only if not already initialized
    if (!isInitialized && !initializingRef.current) {
      initializeAuth();
    }

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []); // Remove initializeAuth and isInitialized from dependencies

  // ---------- HANDLE ROUTE CHANGES (MUCH MORE CONSERVATIVE) ----------
  useEffect(() => {
    // Only check auth on route change if:
    // 1. We're initialized
    // 2. We're not currently loading
    // 3. The path actually changed
    // 4. We're not already initializing
    if (
      isInitialized &&
      !loading &&
      lastPathRef.current !== pathname &&
      !initializingRef.current &&
      user
    ) {
      lastPathRef.current = pathname;
      log("Route change detected", pathname);

      // Instead of full re-initialization, just verify the user is still valid
      supabase.auth.getUser().then(({ data: { user: currentUser }, error }) => {
        if (error || !currentUser || currentUser.id !== user.id) {
          log("User validation failed on route change, reinitializing");
          initializeAuth();
        }
      });
    } else {
      lastPathRef.current = pathname;
    }
  }, [pathname, isInitialized, loading, user, initializeAuth]);

  // ---------- REMOVE WINDOW FOCUS LISTENER (CAUSES TOO MANY CALLS) ----------
  // The window focus listener was causing excessive re-initialization
  // If you need to check auth on window focus, consider debouncing it or
  // checking less frequently

  return {
    user,
    userData,
    userRole,
    loading,
    error,
    isInitialized,
    hasPermission: (r: UserRole) =>
      userRole === "admin" || (userRole === "salesrep" && r === "salesrep"),
  };
};
