import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "outline";
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-sans transition-colors border";

  const variants = {
    primary: "bg-primary/10 text-primary border-transparent",
    secondary: "bg-background text-text-secondary border-border-color",
    success: "bg-success/10 text-success border-transparent",
    warning: "bg-warning/10 text-warning border-transparent",
    error: "bg-error/10 text-error border-transparent",
    outline: "bg-transparent text-text-primary border-border-color",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
}
