/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { supabase } from "@/app/_lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
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
    log("Initializing auth...");
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user: verifiedUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!verifiedUser) {
        log("No verified user found — redirecting to /login");
        setUser(null);
        setUserData(null);
        setUserRole(null);
        router.replace("/login");
        return;
      }

      log("Verified user", { id: verifiedUser.id, email: verifiedUser.email });
      setUser(verifiedUser);

      const profile = await fetchUserData(
        verifiedUser.id,
        verifiedUser.email || ""
      );

      if (profile) {
        log("Loaded user profile", profile);
        setUserData(profile);
        setUserRole(profile.role);
      }
    } catch (err: any) {
      log("Auth init error", err.message);
      setError(err.message || "Authentication failed");
      setUser(null);
      setUserData(null);
      setUserRole(null);
      router.replace("/login");
    } finally {
      setLoading(false);
      setIsInitialized(true);
      log("Auth init complete", { isInitialized: true });
    }
  }, [fetchUserData, router]);

  // ---------- SUBSCRIBE TO AUTH STATE ----------
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event) => {
      log(`Auth state change: ${_event}`);
      initializeAuth();
    });

    if (!isInitialized) initializeAuth();

    window.addEventListener("focus", initializeAuth);
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("focus", initializeAuth);
    };
  }, [initializeAuth, isInitialized]);

  // ---------- ROUTE CHANGE RE-CHECK ----------
  useEffect(() => {
    if (isInitialized && !loading) {
      log("Route change detected, re-initializing auth", pathname);
      initializeAuth();
    }
  }, [pathname, initializeAuth, isInitialized, loading]);

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
