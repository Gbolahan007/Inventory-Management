/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { supabase } from "@/app/_lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type UserRole = "admin" | "salesrep" | null;

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

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
        role: (data.role as UserRole) || "admin",
      };
    },
    []
  );

  const fetchUserData = useCallback(
    async (userId: string, email: string): Promise<UserData | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("users")
        .select("id, email, name, role")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log("[useAuth] User not found, creating new record");
          return await createUserRecord(userId, email);
        }
        return { id: userId, email, name: email.split("@")[0], role: "admin" };
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: (data.role as UserRole) || "admin",
      };
    },
    [createUserRecord]
  );

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message);

      const session: Session | null = data.session;

      if (session?.user) {
        setUser(session.user);
        const data = await fetchUserData(
          session.user.id,
          session.user.email || ""
        );
        if (data) {
          setUserData(data);
          setUserRole(data.role);
        }
      } else {
        setUser(null);
        setUserData(null);
        setUserRole(null);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setUser(null);
      setUserData(null);
      setUserRole(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [fetchUserData]);

  const handleAuthStateChange = useCallback(
    async (event: string, session: Session | null) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setUserData(null);
        setUserRole(null);
        setError(null);
        setLoading(false);
        setIsInitialized(true);
        router.push("/login"); // Redirect out if signed out
      }
      if (["SIGNED_IN", "TOKEN_REFRESHED"].includes(event) && session?.user) {
        setLoading(true);
        setUser(session.user);
        const data = await fetchUserData(
          session.user.id,
          session.user.email || ""
        );
        if (data) {
          setUserData(data);
          setUserRole(data.role);
          setError(null);
        }
        setLoading(false);
        setIsInitialized(true);
      }
    },
    [fetchUserData, router]
  );

  const updateUserName = useCallback(
    async (newName: string): Promise<boolean> => {
      if (!user || !userData) return false;
      try {
        const { error } = await supabase
          .from("users")
          .update({ name: newName })
          .eq("id", user.id);
        if (error) throw new Error(error.message);
        setUserData((prev) => (prev ? { ...prev, name: newName } : null));
        return true;
      } catch {
        return false;
      }
    },
    [user, userData]
  );

  const hasPermission = useCallback(
    (requiredRole: UserRole) =>
      isInitialized &&
      (userRole === "admin" ||
        (userRole === "salesrep" && requiredRole === "salesrep")),
    [userRole, isInitialized]
  );

  const refreshAuth = useCallback(() => {
    setIsInitialized(false);
    setError(null);
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(
      handleAuthStateChange
    );

    initializeAuth();

    // 🔄 Re‑check auth on browser focus
    const handleFocus = () => initializeAuth();
    window.addEventListener("focus", handleFocus);

    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("focus", handleFocus);
    };
  }, [handleAuthStateChange, initializeAuth]);

  // 🔄 Re‑check auth on route change
  useEffect(() => {
    if (isInitialized) initializeAuth();
  }, [pathname, initializeAuth, isInitialized]);

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
