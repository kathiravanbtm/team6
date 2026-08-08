"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { DifficultyBadge } from "@/components/learnforge/badges";
import { FileText, Play, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";

export interface QuizItem {
  id: string;
  title: string;
  sourceDocument: string;
  questionsCount: number;
  difficulty: "easy" | "medium" | "hard" | string;
  progress: number; // 0 to 100
  bestScore?: number; // e.g. 80 (meaning 80%)
}

interface QuizCardProps {
  quiz: QuizItem;
  onStart?: (id: string) => void;
}

export function QuizCard({ quiz, onStart }: QuizCardProps) {
  const isCompleted = quiz.progress === 100;

  return (
    <Card hoverLift className="flex flex-col justify-between font-sans border-border-color/85">
      <div>
        <div className="flex items-start justify-between">
          <DifficultyBadge difficulty={quiz.difficulty} />
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </span>
          )}
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-text-primary text-base line-clamp-1 leading-snug">
            {quiz.title}
          </h4>
          <span className="text-xs text-text-secondary mt-1 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Source: {quiz.sourceDocument}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center text-xs font-semibold text-text-secondary mb-1.5">
          <span>{quiz.questionsCount} Questions</span>
          {quiz.bestScore !== undefined && (
            <span>Best Score: {quiz.bestScore}%</span>
          )}
        </div>
        <ProgressBar value={quiz.progress} className="mb-4" />

        <Button
          variant={isCompleted ? "outline" : "primary"}
          size="sm"
          onClick={() => onStart?.(quiz.id)}
          className="w-full flex items-center justify-center gap-1 text-xs h-9 cursor-pointer"
        >
          {isCompleted ? "Retake Quiz" : "Start Practice"}
          {isCompleted ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" />
          )}
        </Button>
      </div>
    </Card>
  );
}
