"use server";

import { supabaseAdmin } from "@/app/_lib/supabase-admin";

export async function addUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as "admin" | "salesrep";

  // Validate input
  if (!email || !password || !role) {
    return { error: "Email, password, and role are required." };
  }

  try {
    const { count } = await supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", role);

    const maxLimit = role === "admin" ? 3 : 5;

    if (count && count >= maxLimit) {
      return { error: `Cannot create more than ${maxLimit} ${role}s.` };
    }
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.log(error);
      return { error: error.message };
    }

    const userId = data.user?.id;

    if (!userId) {
      return { error: "Failed to create user - no user ID returned." };
    }

    // Insert user into users table
    const { error: insertError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email,
      role,
    });

    if (insertError) {
      // If inserting to users table fails, we should clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { error: `Failed to create user profile: ${insertError.message}` };
    }

    return {
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } created successfully.`,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: "An unexpected error occurred while creating the user." };
  }
}
