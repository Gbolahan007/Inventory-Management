"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const supabase = createServerActionClient({ cookies });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);

      if (error.message.includes("Invalid login credentials")) {
        return { error: "Invalid email or password" };
      } else if (error.message.includes("Email not confirmed")) {
        return { error: "Please confirm your email address" };
      } else {
        return { error: "Login failed. Please try again." };
      }
    }

    const user = data.user;
    if (!user) {
      return { error: "Login failed. Please try again." };
    }

    console.log("Login successful for user:", user.email);
  } catch (error) {
    console.error("Unexpected login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }

  // Redirect after successful login
  redirect("/dashboard");
}
