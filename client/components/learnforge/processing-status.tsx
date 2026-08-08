"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ProcessingStep {
  id: string;
  label: string;
  status: "idle" | "running" | "completed";
}

interface ProcessingStatusProps {
  steps: ProcessingStep[];
  title?: string;
  className?: string;
}

export function ProcessingStatus({
  steps,
  title = "Analyzing your study material",
  className,
}: ProcessingStatusProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto p-6 border-border-color bg-surface rounded-xl font-sans", className)}>
      <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
        <Loader2 className="h-4.5 w-4.5 animate-spin text-primary shrink-0" />
        {title}
      </h3>

      <div className="flex flex-col gap-4">
        {steps.map((step) => {
          const isCompleted = step.status === "completed";
          const isRunning = step.status === "running";

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 transition-opacity duration-200",
                step.status === "idle" ? "opacity-50" : "opacity-100"
              )}
            >
              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : isRunning ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Circle className="h-5 w-5 text-border-color" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isCompleted
                    ? "text-text-primary line-through opacity-70"
                    : isRunning
                    ? "text-primary font-semibold"
                    : "text-text-secondary"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
