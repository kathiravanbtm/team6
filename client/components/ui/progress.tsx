"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  showLabel = false,
  className,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("w-full font-sans", className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold text-text-secondary">
          <span>Progress</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-border-color rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export interface ProgressRingProps extends React.SVGProps<SVGSVGElement> {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
}

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  showText = true,
  className,
  ...props
}: ProgressRingProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className="inline-flex items-center justify-center relative font-sans">
      <svg
        height={size}
        width={size}
        className={cn("-rotate-90", className)}
        {...props}
      >
        <circle
          className="text-border-color"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className="text-primary"
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
        />
      </svg>
      {showText && (
        <div className="absolute text-xs font-semibold text-text-primary">
          {clampedValue}%
        </div>
      )}
    </div>
  );
}

export const CircularProgress = ProgressRing;
