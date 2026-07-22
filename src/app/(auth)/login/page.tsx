import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { LoginSceneWrapper } from "@/components/auth/login-scene-wrapper";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const { user, profile } = await getCurrentUser();
  const params = await searchParams;

  if (user && profile) {
    redirect("/dashboard");
  }

  const configured = isSupabaseConfigured();

  return (
    <main className="min-h-screen w-full overflow-hidden bg-slate-950">
      <LoginSceneWrapper configured={configured} error={params?.error} />
    </main>
  );
}
