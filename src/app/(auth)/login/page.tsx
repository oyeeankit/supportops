import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
            SO
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">SupportOps</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage daily support and QA operations.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Use your internal account credentials.</CardDescription>
          </CardHeader>
          <CardContent>
            {!configured ? (
              <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                Supabase environment variables are missing. Copy `.env.example` to `.env.local`
                and add your project URL and anon key.
              </div>
            ) : null}
            {params?.error === "profile" ? (
              <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                Your login exists, but no SupportOps profile is assigned yet. Ask the Manager to
                create your profile.
              </div>
            ) : null}
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
