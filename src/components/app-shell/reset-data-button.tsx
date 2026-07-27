"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, AlertTriangle } from "lucide-react";
import { resetAllDailyDataAction } from "@/features/daily-reports/actions";

export function ResetDataButton() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);

  const handleReset = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 5000);
      return;
    }

    setLoading(true);
    try {
      const res = await resetAllDailyDataAction();
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setConfirming(false);
          window.location.reload();
        }, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={confirming ? "destructive" : "outline"}
      size="sm"
      onClick={handleReset}
      disabled={loading}
      className="rounded-xl text-xs font-bold gap-1.5 cursor-pointer shrink-0"
    >
      {loading ? (
        <>
          <RotateCcw className="h-3.5 w-3.5 animate-spin" />
          <span>Resetting Data...</span>
        </>
      ) : success ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          <span>Data Reset to 0!</span>
        </>
      ) : confirming ? (
        <>
          <AlertTriangle className="h-3.5 w-3.5 text-white" />
          <span>Click Again to Confirm Reset</span>
        </>
      ) : (
        <>
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset All Data Numbers</span>
        </>
      )}
    </Button>
  );
}
