"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface QuestionItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuestionCardProps {
  question: QuestionItem;
  selectedOption: number | null;
  onSelectOption: (index: number) => void;
  isSubmitted: boolean;
  onSubmit: () => void;
  onNext?: () => void;
  isLastQuestion?: boolean;
}

export function QuestionCard({
  question: q,
  selectedOption,
  onSelectOption,
  isSubmitted,
  onSubmit,
  onNext,
  isLastQuestion = false,
}: QuestionCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto border-border-color bg-surface p-6 sm:p-8 rounded-xl shadow-xs font-sans">
      <div className="flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
        <h3 className="text-lg font-bold text-text-primary leading-snug">
          {q.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="mt-6 flex flex-col gap-3">
        {q.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = q.correctIndex === index;
          const isWrong = isSelected && !isCorrect;

          let optionStyle = "border-border-color hover:bg-background";
          let badgeIcon = null;

          if (isSubmitted) {
            if (isCorrect) {
              optionStyle = "border-success bg-success/5 text-success font-medium";
              badgeIcon = <Check className="h-4 w-4 text-success shrink-0" />;
            } else if (isWrong) {
              optionStyle = "border-error bg-error/5 text-error font-medium";
              badgeIcon = <X className="h-4 w-4 text-error shrink-0" />;
            } else {
              optionStyle = "border-border-color opacity-60";
            }
          } else if (isSelected) {
            optionStyle = "border-primary bg-primary/5 text-primary font-medium ring-2 ring-primary/20";
          }

          return (
            <motion.button
              key={index}
              disabled={isSubmitted}
              onClick={() => onSelectOption(index)}
              whileHover={{ scale: isSubmitted ? 1 : 1.005 }}
              whileTap={{ scale: isSubmitted ? 1 : 0.995 }}
              className={cn(
                "w-full text-left p-4.5 rounded-lg border text-sm flex items-center justify-between cursor-pointer focus:outline-none transition-colors",
                optionStyle
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "h-6 w-6 rounded-full border text-xs font-semibold flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-border-color text-text-secondary"
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-text-primary leading-tight">{option}</span>
              </div>
              {badgeIcon}
            </motion.button>
          );
        })}
      </div>

      {/* AI Explanation Area */}
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-5 bg-background border border-border-color rounded-lg text-sm text-text-secondary leading-relaxed"
        >
          <div className="flex items-center gap-2 mb-2 text-text-primary font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>AI Tutor Explanation</span>
          </div>
          {q.explanation}
        </motion.div>
      )}

      {/* Footer Controls */}
      <div className="mt-8 pt-5 border-t border-border-color/60 flex justify-end gap-3">
        {!isSubmitted ? (
          <Button
            variant="primary"
            disabled={selectedOption === null}
            onClick={onSubmit}
            className="w-full sm:w-auto px-6 cursor-pointer"
          >
            Submit Answer
          </Button>
        ) : (
          onNext && (
            <Button
              variant="primary"
              onClick={onNext}
              className="w-full sm:w-auto px-6 cursor-pointer"
            >
              {isLastQuestion ? "Finish Practice" : "Next Question"}
            </Button>
          )
        )}
      </div>
    </Card>
  );
}
