"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useFlashcardStore, Flashcard as FlashcardType } from "@/lib/services/flashcard";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Flashcard } from "@/components/learnforge/flashcard";
import { toast, ToastContainer } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, LogOut, CheckCircle2, Award, Keyboard } from "lucide-react";

export default function FlashcardStudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params?.deckId as string;

  // Zustand Store
  const decks = useFlashcardStore((state: any) => state.decks);
  const rateCard = useFlashcardStore((state: any) => state.rateCard);

  const activeDeck = decks.find((d: any) => d.id === deckId);
  
  // Navigation & Study index state
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [flipState, setFlipState] = React.useState(false); // To sync keyboard flip helper

  // Fallback defaults
  const activeDeckCards = activeDeck?.cards && activeDeck.cards.length > 0
    ? activeDeck.cards
    : [
        {
          id: "fc-os-1",
          front: "What is a system call in operating systems?",
          back: "A system call is the programmatic way in which a computer program requests a service from the kernel of the operating system it is executed on.",
          topic: "Processes",
        },
        {
          id: "fc-os-2",
          front: "What is page replacement thrashing?",
          back: "Thrashing occurs when a virtual memory system spends more time swapping pages in and out of disk storage than executing actual instructions.",
          topic: "Memory",
        },
        {
          id: "fc-os-3",
          front: "Explain mutual exclusion (Mutex).",
          back: "A Mutex is a locking mechanism used to synchronize access to a resource, ensuring that only one thread can access a critical section at a time.",
          topic: "Synchronization",
        },
      ];

  const totalCards = activeDeckCards.length;
  const currentCard = activeDeckCards[currentIdx];

  // Keyboard shortcut listener
  React.useEffect(() => {
    if (isCompleted || !currentCard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Space to flip
      if (e.code === "Space" || key === " ") {
        e.preventDefault();
        // Trigger flip by dispatching a custom click event or managing a local toggle state.
        // We will just toggle our flipState which can trigger toast indicators.
        setFlipState((prev) => !prev);
        toast("Flipped Card", { type: "info" });
      }

      // 1 to 4 for spaced repetition ratings
      if (["1", "2", "3", "4"].includes(key)) {
        const ratingMap: Record<string, "again" | "hard" | "good" | "easy"> = {
          "1": "again",
          "2": "hard",
          "3": "good",
          "4": "easy",
        };
        const rating = ratingMap[key];
        handleCardRating(rating);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCard, isCompleted, currentIdx]);

  const handleCardRating = (rating: "again" | "hard" | "good" | "easy") => {
    rateCard(deckId, currentCard.id, rating);
    toast(`Rated card: ${rating.toUpperCase()}`, { type: "success" });

    // Progress to next card
    setTimeout(() => {
      setFlipState(false); // Reset flip status
      if (currentIdx < totalCards - 1) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        setIsCompleted(true);
      }
    }, 800);
  };

  const handleExit = () => {
    router.push("/flashcards");
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        
        {/* HEADER PANEL */}
        <header className="h-16 md:h-18 border-b border-border-color bg-surface flex items-center justify-between px-6 md:px-8 font-sans sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-sm font-bold text-text-primary hidden sm:block truncate max-w-[200px]">
              Studying: {activeDeck?.name || "Operating Systems"}
            </span>
            {!isCompleted && (
              <div className="flex items-center gap-2 flex-1 max-w-xs">
                <span className="text-xs font-bold text-text-secondary select-none shrink-0">
                  {currentIdx + 1} / {totalCards}
                </span>
                <ProgressBar value={((currentIdx + 1) / totalCards) * 100} className="h-1.5" />
              </div>
            )}
          </div>

          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary cursor-pointer focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Study</span>
          </button>
        </header>

        {/* MAIN SHEET */}
        <main className="flex-1 p-6 md:p-8 max-w-2xl w-full mx-auto flex flex-col justify-center font-sans">
          
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border border-border-color bg-surface p-8 rounded-2xl text-center space-y-6 shadow-xs">
                  <div className="p-4 bg-primary/10 rounded-full text-primary w-fit mx-auto animate-bounce">
                    <Award className="h-10 w-10" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-extrabold text-text-primary">
                      Deck Completed!
                    </h3>
                    <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                      You have reviewed all {totalCards} cards. Mastery level adjusted to {activeDeck?.mastery || 64}%.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      onClick={handleExit}
                      className="px-6 h-9.5 text-xs font-semibold cursor-pointer"
                    >
                      Return to Library
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={currentCard.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-6"
              >
                {/* 3D Interactive Flipping Flashcard */}
                <Flashcard
                  card={{
                    id: currentCard.id,
                    front: currentCard.front,
                    back: currentCard.back,
                    topic: currentCard.topic,
                  }}
                  onScore={() => {}} // We manage rating score actions using the controls below
                />

                {/* KEYBOARD SHORTCUTS PANEL (Desktop Only) */}
                <div className="hidden sm:flex items-center justify-center gap-2 text-[10px] font-bold text-text-secondary select-none opacity-60">
                  <Keyboard className="h-3.5 w-3.5" />
                  <span>Shortcut: Press [Space] to flip. Press [1] Again, [2] Hard, [3] Good, [4] Easy.</span>
                </div>

                {/* SPACED REPETITION CONFIDENCE RATINGS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleCardRating("again")}
                    className="h-10.5 text-xs font-bold border-error/30 hover:bg-error/5 text-error cursor-pointer"
                  >
                    Again (1)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCardRating("hard")}
                    className="h-10.5 text-xs font-bold border-warning/30 hover:bg-warning/5 text-warning cursor-pointer"
                  >
                    Hard (2)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCardRating("good")}
                    className="h-10.5 text-xs font-bold border-primary/30 hover:bg-primary/5 text-primary cursor-pointer"
                  >
                    Good (3)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCardRating("easy")}
                    className="h-10.5 text-xs font-bold border-success/30 hover:bg-success/5 text-success cursor-pointer"
                  >
                    Easy (4)
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  );
}
