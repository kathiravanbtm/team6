"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverLift?: boolean;
  asMotion?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverLift = false, asMotion = false, ...props }, ref) => {
    const Component = asMotion ? motion.div : "div";
    const motionProps = asMotion && hoverLift
      ? {
          whileHover: { y: -4, transition: { duration: 0.2, ease: "easeOut" } },
        }
      : {};

    return (
      // @ts-ignore
      <Component
        ref={ref}
        className={cn(
          "rounded-lg border border-border-color bg-surface p-6 text-text-primary shadow-xs transition-shadow duration-200",
          hoverLift && "hover:shadow-md cursor-pointer",
          className
        )}
        {...motionProps}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-sans text-lg font-semibold leading-none tracking-tight text-text-primary",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("font-sans text-sm text-text-secondary", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("font-sans", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center pt-4 border-t border-border-color mt-4", className)}
      {...props}
    />
  );
}
