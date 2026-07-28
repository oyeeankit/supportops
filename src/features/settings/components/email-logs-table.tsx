"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { retryQueuedEmailAction, processEmailQueueNowAction } from "../actions";
import type { EmailQueueItem } from "@/lib/notifications/types";
import { Mail, CheckCircle2, XCircle, Clock, RotateCw, RefreshCw, AlertTriangle } from "lucide-react";

interface EmailLogsTableProps {
  initialLogs: EmailQueueItem[];
}

export function EmailLogsTable({ initialLogs }: EmailLogsTableProps) {
  const [logs, setLogs] = useState<EmailQueueItem[]>(initialLogs);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRetry(queueId: string) {
    setRetryingId(queueId);
    setMessage(null);

    const res = await retryQueuedEmailAction(queueId);
    setRetryingId(null);
    setMessage(res.message);

    if (res.success) {
      setLogs((prev) =>
        prev.map((item) =>
          item.id === queueId ? { ...item, status: "sent", sent_at: new Date().toISOString(), error_message: null } : item
        )
      );
    }
  }

  async function handleProcessQueue() {
    setIsProcessingQueue(true);
    setMessage(null);

    const res = await processEmailQueueNowAction();
    setIsProcessingQueue(false);
    setMessage(res.message);
  }

  return (
    <div className="space-y-6 font-sans">
      {message && (
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-border text-xs font-semibold text-foreground flex items-center justify-between">
          <span>{message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-foreground">Email Queue & Delivery Audit Logs</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time status of all employee & manager notification emails.</p>
        </div>
        <Button
          size="sm"
          onClick={handleProcessQueue}
          disabled={isProcessingQueue}
          className="rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isProcessingQueue ? "animate-spin" : ""}`} />
          {isProcessingQueue ? "Processing Queue..." : "Process Pending Queue"}
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-xs font-bold">No email activity logged yet</p>
            <p className="text-[11px]">Submitted report emails will appear in this audit log.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border uppercase font-extrabold text-[10px] text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date / Time</th>
                  <th className="px-6 py-3.5">Recipient</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Attempts</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-foreground whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="px-6 py-3.5">
                      <div className="font-extrabold text-foreground">{item.recipient_email}</div>
                      {item.cc_emails && item.cc_emails.length > 0 && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          CC: {item.cc_emails.join(", ")}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-3.5 max-w-xs truncate font-medium text-foreground">
                      {item.subject}
                    </td>

                    <td className="px-6 py-3.5">
                      {item.status === "sent" && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Sent
                        </Badge>
                      )}
                      {item.status === "pending" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 text-[10px] font-bold">
                          <Clock className="h-3 w-3 mr-1" /> Pending
                        </Badge>
                      )}
                      {item.status === "failed" && (
                        <div className="space-y-1">
                          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] font-bold">
                            <XCircle className="h-3 w-3 mr-1" /> Failed
                          </Badge>
                          {item.error_message && (
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-mono truncate max-w-xs" title={item.error_message}>
                              {item.error_message}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-3.5 font-bold text-muted-foreground">
                      {item.attempts} / {item.max_attempts}
                    </td>

                    <td className="px-6 py-3.5 text-right">
                      {item.status === "failed" && (
                        <Button
                          size="sm"
                          onClick={() => handleRetry(item.id)}
                          disabled={retryingId === item.id}
                          className="rounded-lg text-[11px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                        >
                          <RotateCw className={`h-3 w-3 mr-1 ${retryingId === item.id ? "animate-spin" : ""}`} />
                          Retry
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
