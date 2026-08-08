"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Sparkles, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  topic?: string;
}

interface FlashcardProps {
  card: FlashcardItem;
  onScore?: (id: string, gotIt: boolean) => void;
  className?: string;
}

export function Flashcard({ card, onScore, className }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  // Reset flip status when card changes
  React.useEffect(() => {
    setIsFlipped(false);
  }, [card]);

  return (
    <div className={cn("w-full max-w-lg mx-auto font-sans h-80 relative select-none", className)}>
      <motion.div
        className="w-full h-full cursor-pointer relative"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT SIDE */}
        <Card
          className="absolute inset-0 w-full h-full flex flex-col justify-between border-border-color bg-surface p-8 shadow-xs rounded-xl backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded">
              Question
            </span>
            {card.topic && (
              <span className="text-xs text-text-secondary font-medium">
                #{card.topic}
              </span>
            )}
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-lg font-semibold text-text-primary text-center leading-relaxed">
              {card.front}
            </p>
          </div>

          <div className="flex justify-center items-center gap-1.5 text-xs text-text-secondary font-medium">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Click card to reveal answer</span>
          </div>
        </Card>

        {/* BACK SIDE */}
        <Card
          className="absolute inset-0 w-full h-full flex flex-col justify-between border-border-color bg-surface p-8 shadow-xs rounded-xl backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-success uppercase tracking-wider bg-success/10 px-2.5 py-1 rounded">
              Answer
            </span>
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Explanation
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto no-scrollbar">
            <p className="text-base font-medium text-text-primary text-center leading-relaxed">
              {card.back}
            </p>
          </div>

          {/* Action buttons (only clickable when flipped to back) */}
          <div
            className="flex justify-center items-center gap-3"
            onClick={(e) => e.stopPropagation()} // Prevent reflipping card
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onScore?.(card.id, false)}
              className="flex-1 border-error/30 text-error hover:bg-error/5 h-9 text-xs cursor-pointer"
            >
              <X className="h-4 w-4 mr-1" />
              Still learning
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onScore?.(card.id, true)}
              className="flex-1 border-success/30 text-success hover:bg-success/5 h-9 text-xs cursor-pointer"
            >
              <Check className="h-4 w-4 mr-1" />
              Got it
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
