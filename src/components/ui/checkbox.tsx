import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={cn(
          "h-4 w-4 rounded border-border text-primary shadow-sm focus:ring-2 focus:ring-primary/20 accent-primary cursor-pointer transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";
