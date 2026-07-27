import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MinimalLoginForm } from "./minimal-login-form";

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
    <main className="min-h-screen w-full flex items-center justify-center bg-background p-4 font-sans text-foreground">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-sm space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-lg shadow-sm mb-1">
            SO
          </div>
          <h1 className="text-xl font-black tracking-tight text-foreground">SupportOps</h1>
          <p className="text-xs font-semibold text-muted-foreground">
            Sign in to access your team operations portal
          </p>
        </div>

        {!configured && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-medium">
            ⚠️ Supabase environment variables not configured.
          </div>
        )}

        {params?.error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs font-medium">
            {params.error === "profile"
              ? "Account profile not found. Please contact your manager."
              : "Authentication failed. Please check your credentials."}
          </div>
        )}

        <MinimalLoginForm />
      </div>
    </main>
  );
}
