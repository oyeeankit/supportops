import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, UserProfile } from "./roles";

type ProfileRow = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  employment_status: "active" | "inactive";
  roles: {
    name: AppRole;
  } | null;
};

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return { user: null, profile: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, auth_user_id, full_name, email, employment_status, roles(name)")
    .eq("auth_user_id", user.id)
    .single<ProfileRow>();

  const profile: UserProfile | null = data?.roles
    ? {
        id: data.id,
        auth_user_id: data.auth_user_id,
        full_name: data.full_name,
        email: data.email,
        employment_status: data.employment_status,
        role: data.roles.name,
      }
    : null;

  return { user, profile };
}

export async function requireUser() {
  const { user, profile } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!profile) {
    redirect("/login?error=profile");
  }

  return { user, profile };
}

export async function requireRole(allowedRoles: AppRole[]) {
  const session = await requireUser();

  if (!allowedRoles.includes(session.profile.role)) {
    redirect("/dashboard?error=forbidden");
  }

  return session;
}
