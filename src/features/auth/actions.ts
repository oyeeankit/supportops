"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "./schemas";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  message?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return {
      message:
        "Supabase is not configured yet. Add your environment variables before signing in.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Please fix the highlighted fields.",
    };
  }

  try {
    const supabase = await createClient();
    let { error } = await supabase.auth.signInWithPassword(parsed.data);

    const teamEmails = [
      "mane@thaliatechnologies.com",
      "lalit@thaliatechnologies.com",
      "shivam@thaliatechnologies.com",
      "gauravsalvi@thaliatechnologies.com",
      "prathamesh@thaliatechnologies.com",
      "rupali@thaliatechnologies.com",
    ];

    // If valid team account is not registered in remote Supabase Auth yet, auto-signUp and signIn
    if (
      error &&
      teamEmails.includes(parsed.data.email.toLowerCase().trim()) &&
      parsed.data.password === "password123"
    ) {
      const signUpRes = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (!signUpRes.error) {
        const retry = await supabase.auth.signInWithPassword(parsed.data);
        if (!retry.error) {
          error = null;
        }
      }
    }

    if (error) {
      return {
        message: error.message,
      };
    }
  } catch (err: any) {
    console.error("[Login] Auth connection failure:", err?.message || err);
    return {
      message: "Connection failed: Supabase backend is unreachable. Please verify NEXT_PUBLIC_SUPABASE_URL in .env.local.",
    };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
