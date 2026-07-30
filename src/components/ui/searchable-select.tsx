"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Search, Check } from "lucide-react";

export type SearchableOption = {
  value: string;
  label: string;
};

export type SearchableGroup = {
  label: string;
  options: SearchableOption[];
};

type Props = {
  groups: SearchableGroup[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function SearchableSelect({
  groups,
  value,
  onChange,
  placeholder = "Select...",
  className,
  disabled = false,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const selectedLabel = React.useMemo(() => {
    for (const group of groups) {
      const found = group.options.find((opt) => opt.value === value);
      if (found) return found.label;
    }
    return value || "";
  }, [groups, value]);

  // Close on outside click (also checks the portal dropdown element)
  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setSearch("");
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Focus search input when opened
  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Compute dropdown position from button's bounding rect (fixed positioning via portal)
  React.useEffect(() => {
    if (!open || !buttonRef.current) return;
    function updatePosition() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const filteredGroups = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return groups;
    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter((opt) =>
          opt.label.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [groups, search]);

  function handleSelect(val: string) {
    onChange(val);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-border/80 bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
        )}
      >
        <span className={cn("truncate", !selectedLabel && "text-muted-foreground font-normal")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && mounted
        ? createPortal(
            <div
              ref={dropdownRef}
              style={dropdownStyle}
              className="max-h-80 overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-2xl z-[99999]"
            >
              <div className="flex items-center border-b border-border/60 px-3 bg-muted/20">
                <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search app..."
                  className="h-9 w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                {filteredGroups.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                    No matching app found.
                  </p>
                ) : (
                  filteredGroups.map((group) => (
                    <div key={group.label} className="py-1">
                      <p className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                        {group.label}
                      </p>
                      {group.options.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleSelect(opt.value)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer",
                            opt.value === value && "bg-slate-100 dark:bg-slate-800 font-bold text-foreground",
                          )}
                        >
                          <span className="truncate">{opt.label}</span>
                          {opt.value === value ? (
                            <Check className="ml-2 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
