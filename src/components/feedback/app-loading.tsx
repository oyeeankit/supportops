"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SupportOpsLoader } from "@/components/loading/supportops-loader";

type AppLoadingContextValue = {
  isLoading: boolean;
  label: string;
  startLoading: (label?: string) => void;
  stopLoading: () => void;
};

const AppLoadingContext = createContext<AppLoadingContextValue | null>(null);

export function AppLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState({ isLoading: false, label: "Loading..." });

  const startLoading = useCallback((label = "Loading...") => {
    setState({ isLoading: true, label });
  }, []);

  const stopLoading = useCallback(() => {
    setState((current) => ({ ...current, isLoading: false }));
  }, []);

  const routeKey = `${pathname}${searchParams?.toString() ?? ""}`;
  useEffect(() => {
    const id = setTimeout(() => {
      setState((current) => ({ ...current, isLoading: false }));
    }, 0);
    return () => clearTimeout(id);
  }, [routeKey]);

  const value = useMemo(
    () => ({
      isLoading: state.isLoading,
      label: state.label,
      startLoading,
      stopLoading,
    }),
    [startLoading, state.isLoading, state.label, stopLoading],
  );

  return (
    <AppLoadingContext.Provider value={value}>
      {children}
      {state.isLoading ? <AppLoadingOverlay label={state.label} /> : null}
    </AppLoadingContext.Provider>
  );
}

export function useAppLoading() {
  const context = useContext(AppLoadingContext);

  if (!context) {
    throw new Error("useAppLoading must be used inside AppLoadingProvider.");
  }

  return context;
}

export function AppLoadingOverlay({ label }: { label: string }) {
  return (
    <div className="fixed inset-0 z-50">
      <SupportOpsLoader label={label} />
    </div>
  );
}
