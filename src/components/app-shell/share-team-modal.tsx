"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, ExternalLink, X, Users } from "lucide-react";

export function ShareTeamModal() {
  const [open, setOpen] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedMessage, setCopiedMessage] = React.useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const landingUrl = `${origin}/landing`;
  const loginUrl = `${origin}/login`;

  const teamMessage = `Hi Team,

We have deployed our new SupportOps Daily Reporting Portal!

🌐 Product Landing Page: ${landingUrl}
🔑 Login & Submit Daily Log: ${loginUrl}

📝 How to submit daily reports:
1. Log in with your work email (e.g. name@thaliatechnologies.com) and password (password123).
2. Click "My Reports" ➔ "Submit Today's Report".
3. Log your tickets, chats, and testing work (takes under 2 minutes!).

Drafts auto-save every 30 seconds as you type.`;

  const copyToClipboard = (text: string, type: "link" | "message") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={() => setOpen(true)}
        className="rounded-xl text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-sm"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>Share with Team</span>
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in relative text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-black">Share SupportOps with Team</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Links section */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Product Landing Page Link
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    readOnly
                    value={landingUrl}
                    className="flex-1 text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-border rounded-xl px-3 py-2 text-foreground"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(landingUrl, "link")}
                    className="rounded-xl text-xs font-bold gap-1 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedLink ? "Copied!" : "Copy Link"}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
                  Team Announcement & Instructions
                </label>
                <textarea
                  readOnly
                  rows={6}
                  value={teamMessage}
                  className="mt-1 w-full text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-border rounded-xl p-3 text-foreground"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <a href={landingUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Open Landing Page <ExternalLink className="h-3 w-3" />
              </a>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => copyToClipboard(teamMessage, "message")}
                  className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  {copiedMessage ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copiedMessage ? "Message Copied!" : "Copy Announcement"}
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
