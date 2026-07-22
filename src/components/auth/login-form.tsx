"use client";

import { useActionState, useEffect } from "react";
import { loginAction, type LoginState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCharacterContext } from "./character-context";
import { Eye, EyeOff } from "lucide-react";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const {
    setActiveInput,
    setHoveredField,
    showPassword,
    setShowPassword,
    notifyTyping,
    setAuthStatus,
  } = useCharacterContext();

  useEffect(() => {
    if (pending) {
      setAuthStatus("submitting");
    } else if (state.message || state.fieldErrors) {
      setAuthStatus("error");
    }
  }, [pending, state, setAuthStatus]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
          Work email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@company.com"
          className="border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50"
          onFocus={() => setActiveInput("email")}
          onBlur={() => setActiveInput("none")}
          onMouseEnter={() => setHoveredField("email")}
          onMouseLeave={() => setHoveredField("none")}
          onChange={notifyTyping}
        />
        {state.fieldErrors?.email ? (
          <p className="text-xs font-medium text-red-400">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-semibold text-slate-300">
            Password
          </Label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
            title={showPassword ? "Hide Password" : "Show Password"}
          >
            {showPassword ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                <span>Show</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="border-white/10 bg-slate-950/60 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/50 pr-10"
            onFocus={() => setActiveInput("password")}
            onBlur={() => setActiveInput("none")}
            onMouseEnter={() => setHoveredField("password")}
            onMouseLeave={() => setHoveredField("none")}
            onChange={notifyTyping}
          />
        </div>
        {state.fieldErrors?.password ? (
          <p className="text-xs font-medium text-red-400">{state.fieldErrors.password[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">
          {state.message}
        </div>
      ) : null}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 font-semibold shadow-lg shadow-blue-600/20 py-2.5 rounded-xl transition-all"
        disabled={pending}
      >
        {pending ? "Signing in..." : "Sign in to SupportOps"}
      </Button>
    </form>
  );
}
