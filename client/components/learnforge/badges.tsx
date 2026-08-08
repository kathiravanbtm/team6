import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicBadgeProps {
  topic: string;
  className?: string;
}

export function TopicBadge({ topic, className }: TopicBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("px-2 py-0.5 font-medium flex items-center gap-1 text-xs", className)}
    >
      <Hash className="h-3 w-3 text-text-secondary opacity-70" />
      <span>{topic}</span>
    </Badge>
  );
}

interface DifficultyBadgeProps {
  difficulty: "easy" | "medium" | "hard" | string;
  className?: string;
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const diff = difficulty.toLowerCase();

  const config = {
    easy: { variant: "success" as const, label: "Easy" },
    medium: { variant: "warning" as const, label: "Medium" },
    hard: { variant: "error" as const, label: "Hard" },
  };

  const current = config[diff as keyof typeof config] || {
    variant: "secondary" as const,
    label: difficulty,
  };

  return (
    <Badge
      variant={current.variant}
      className={cn("px-2.5 py-0.5 rounded-full font-medium text-xs tracking-wide capitalize", className)}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {current.label}
    </Badge>
  );
}
