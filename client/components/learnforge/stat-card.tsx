"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: string | number;
    type: "positive" | "negative";
  };
  progress?: number; // 0 to 100
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  progress,
  className,
}: StatCardProps) {
  return (
    <Card hoverLift className={cn("flex flex-col justify-between font-sans", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {title}
          </p>
          <p className="text-2xl font-bold text-text-primary tracking-tight">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-2.5 bg-background rounded-lg border border-border-color/30 text-primary shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(trend || description || typeof progress === "number") && (
        <div className="mt-4 pt-3 border-t border-border-color/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded",
                  trend.type === "positive"
                    ? "text-success bg-success/10"
                    : "text-error bg-error/10"
                )}
              >
                {trend.type === "positive" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-text-secondary">{description}</span>
            )}
          </div>

          {typeof progress === "number" && (
            <div className="w-16 bg-border-color h-1.5 rounded-full overflow-hidden shrink-0">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
