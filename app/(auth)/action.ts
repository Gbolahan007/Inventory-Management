"use server";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const supabase = createServerActionClient({ cookies });

    // Step 1: Sign in the user
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
      } else if (error.message.includes("rate limit")) {
        return {
          error:
            "Too many login attempts. Please wait a few minutes and try again.",
        };
      } else {
        return { error: "Login failed. Please try again." };
      }
    }

    const user = data.user;
    if (!user) {
      return { error: "Login failed. Please try again." };
    }

    // Step 2: Get user role from database
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !userData?.role) {
      console.error("Error fetching user role:", roleError);
      await supabase.auth.signOut();
      return { error: "User role not found. Please contact support." };
    }

    // Step 3: Update user metadata with role
    const { error: updateError } = await supabase.auth.updateUser({
      data: { role: userData.role },
    });

    if (updateError) {
      console.error("Error updating user metadata:", updateError);
      return { error: "Login failed. Please try again." };
    }

    console.log("Login successful for user:", user.email);

    // Return success with redirect URL instead of using redirect()
    const redirectUrl =
      userData.role === "salesrep"
        ? "/dashboard/sales"
        : userData.role === "admin"
        ? "/dashboard"
        : "/dashboard";

    return {
      success: true,
      redirectUrl,
      user: {
        email: user.email,
        role: userData.role,
      },
    };
  } catch (error) {
    console.error("Unexpected login error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
