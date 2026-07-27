"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type LoginState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
    >
      {pending ? "Signing in..." : "Sign in to SupportOps"}
    </Button>
  );
}

export function MinimalLoginForm() {
  const [state, formAction] = useFormState(loginAction, {});
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  // Pre-fill default manager credentials for 1-click login
  const [email, setEmail] = React.useState("mane@thaliatechnologies.com");
  const [password, setPassword] = React.useState("password123");

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-bold text-foreground">
          Work email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary text-xs font-medium rounded-xl h-10"
        />
        {state.fieldErrors?.email && (
          <p className="text-xs font-semibold text-rose-500 mt-1">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-bold text-foreground">
            Password
          </Label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[11px] font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
          >
            {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary text-xs font-medium rounded-xl h-10"
        />
        {state.fieldErrors?.password && (
          <p className="text-xs font-semibold text-rose-500 mt-1">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
          <Checkbox checked={rememberMe} onCheckedChange={(c) => setRememberMe(Boolean(c))} />
          <span>Remember me</span>
        </label>
      </div>

      {state.message && (
        <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-xs font-semibold text-rose-700 dark:text-rose-300">
          {state.message}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
