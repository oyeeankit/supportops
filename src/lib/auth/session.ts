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

  if (!user || !user.email) {
    return { user: null, profile: null };
  }

  // 1. Try finding profile by auth_user_id or email
  let { data } = await supabase
    .from("profiles")
    .select("id, auth_user_id, full_name, email, employment_status, roles(name)")
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle<ProfileRow>();

  // 2. If profile exists by email but auth_user_id needs linking:
  if (data && data.auth_user_id !== user.id) {
    await supabase
      .from("profiles")
      .update({ auth_user_id: user.id })
      .eq("id", data.id);
    data.auth_user_id = user.id;
  }

  // 3. If no profile exists at all for this user, auto-provision one
  if (!data) {
    const isManager = user.email.toLowerCase().includes("mane");
    const isQA = user.email.toLowerCase().includes("shivam") || user.email.toLowerCase().includes("qa");
    const roleName: AppRole = isManager ? "manager" : isQA ? "qa_engineer" : "support_engineer";

    // Fetch role_id
    const { data: roleData } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .single();

    if (roleData) {
      const nameParts = user.email.split("@")[0].split(".");
      const fullName = nameParts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");

      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          auth_user_id: user.id,
          full_name: fullName,
          email: user.email,
          role_id: roleData.id,
          employment_status: "active",
        })
        .select("id, auth_user_id, full_name, email, employment_status, roles(name)")
        .single<ProfileRow>();

      if (newProfile) {
        data = newProfile;
      }
    }
  }

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
