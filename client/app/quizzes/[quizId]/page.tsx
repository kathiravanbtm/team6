"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuizStore, QuizQuestion } from "@/lib/services/quiz";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Dialog } from "@/components/ui/dialog";
import { TopicBadge, DifficultyBadge } from "@/components/learnforge/badges";
import { toast, ToastContainer } from "@/components/ui/toast";
import {
  BrainCircuit,
  Timer,
  LogOut,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  BookOpen,
  Keyboard,
  Info,
  Loader2,
} from "lucide-react";

export default function QuizExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.quizId as string;

  // Zustand Store hooks
  const config = useQuizStore((state: any) => state.config);
  const questions = useQuizStore((state: any) => state.questions);
  const userAnswers = useQuizStore((state: any) => state.userAnswers);
  const selectAnswer = useQuizStore((state: any) => state.selectAnswer);
  const isSubmitted = useQuizStore((state: any) => state.isSubmitted);
  const submitQuiz = useQuizStore((state: any) => state.submitQuiz);
  const timeRemaining = useQuizStore((state: any) => state.timeRemaining);
  const tickTimer = useQuizStore((state: any) => state.tickTimer);
  const resetQuiz = useQuizStore((state: any) => state.resetQuiz);

  // Local navigation & modal states
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false);
  const [shortAnswerText, setShortAnswerText] = React.useState("");

  const activeQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const isPracticeMode = config?.mode === "practice";

  // Countdown timer ticking effect
  React.useEffect(() => {
    if (isSubmitted || totalQuestions === 0) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, totalQuestions, tickTimer]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  // Keyboard shortcut listener for MCQ options (A=1, B=2, C=3, D=4)
  React.useEffect(() => {
    if (!activeQuestion || isSubmitted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing if active field is textarea
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") {
        return;
      }

      const key = e.key.toLowerCase();
      
      // Support A, B, C, D key options
      if (["a", "b", "c", "d"].includes(key) && activeQuestion.options.length > 0) {
        const indexMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
        const index = indexMap[key];
        if (index < activeQuestion.options.length) {
          // If in practice mode, block changing once selected to keep score clear
          if (isPracticeMode && userAnswers[activeQuestion.id] !== undefined) return;
          selectAnswer(activeQuestion.id, index);
          toast(`Selected Option ${key.toUpperCase()}`, { type: "info" });
        }
      }

      // Support 1, 2, 3, 4 number options
      if (["1", "2", "3", "4"].includes(key) && activeQuestion.options.length > 0) {
        const index = parseInt(key, 10) - 1;
        if (index < activeQuestion.options.length) {
          if (isPracticeMode && userAnswers[activeQuestion.id] !== undefined) return;
          selectAnswer(activeQuestion.id, index);
          toast(`Selected Option ${key}`, { type: "info" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeQuestion, isSubmitted, selectAnswer, userAnswers, isPracticeMode]);

  // Fallback redirect if user refreshes on empty store
  React.useEffect(() => {
    if (totalQuestions === 0) {
      router.push("/quizzes/create");
    }
  }, [totalQuestions, router]);

  if (totalQuestions === 0 || !activeQuestion) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center font-sans">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  // Answer states helpers
  const selectedAnswer = userAnswers[activeQuestion.id];
  const hasAnsweredCurrent = selectedAnswer !== undefined;

  // Short answer custom input logic
  const handleShortAnswerSubmit = () => {
    if (!shortAnswerText.trim()) return;
    selectAnswer(activeQuestion.id, shortAnswerText);
    toast("Answer recorded", { type: "success" });
  };

  // Submission handles
  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
      // Sync short answer field
      const nextAns = userAnswers[questions[currentIdx + 1].id];
      setShortAnswerText(typeof nextAns === "string" ? nextAns : "");
    } else {
      // Prompt submit confirm
       const unansweredCount = questions.filter((q: QuizQuestion) => userAnswers[q.id] === undefined).length;
      setShowSubmitConfirm(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      const prevAns = userAnswers[questions[currentIdx - 1].id];
      setShortAnswerText(typeof prevAns === "string" ? prevAns : "");
    }
  };

  const handleFinishSubmit = () => {
    setShowSubmitConfirm(false);
    submitQuiz();
    toast("Quiz submitted!", { type: "success" });
    router.push(`/quizzes/${quizId}/results`);
  };

  const handleExitQuiz = () => {
    resetQuiz();
    router.push("/quizzes/create");
  };

  // Nav dots states
  const getDotStyle = (idx: number) => {
    const q = questions[idx];
    const isCurrent = idx === currentIdx;
    const isAnswered = userAnswers[q.id] !== undefined;

    if (isCurrent) return "ring-2 ring-primary ring-offset-2 bg-primary text-white";
    if (isAnswered) return "bg-primary/20 text-primary border border-primary/30";
    return "bg-surface border border-border-color text-text-secondary hover:bg-background";
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        
        {/* QUIZ WORKSPACE TOP BAR */}
        <header className="h-16 md:h-18 border-b border-border-color bg-surface flex items-center justify-between px-6 md:px-8 font-sans sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-sm font-bold text-text-primary hidden sm:block truncate max-w-[200px]">
              {config?.materialName || "Practice Quiz"}
            </span>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <span className="text-xs font-bold text-text-secondary select-none shrink-0">
                {currentIdx + 1} / {totalQuestions}
              </span>
              <ProgressBar value={((currentIdx + 1) / totalQuestions) * 100} className="h-1.5" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary select-none">
              <Timer className="h-4 w-4 text-primary" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            
            <button
              onClick={() => setShowExitConfirm(true)}
              className="flex items-center gap-1 text-xs font-bold text-error hover:underline cursor-pointer focus:outline-none"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE QUESTION SHEET */}
        <main className="flex-1 p-6 md:p-8 max-w-3xl w-full mx-auto space-y-6 font-sans">
          
          {/* Question Indicators */}
          <div className="flex items-center gap-2 select-none">
            <Badge variant="outline" className="text-[10px] font-bold tracking-wide uppercase">
              Question {currentIdx + 1}
            </Badge>
            <TopicBadge topic={activeQuestion.topic} />
            <DifficultyBadge difficulty={activeQuestion.difficulty} />
            {isPracticeMode && (
              <Badge variant="success" className="text-[9px] font-bold uppercase tracking-wide">
                Practice Mode
              </Badge>
            )}
          </div>

          {/* Question Text */}
          <Card className="border border-border-color bg-surface p-6 rounded-xl shadow-xs">
            <h3 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
              {activeQuestion.question}
            </h3>
          </Card>

          {/* OPTIONS CONTAINER */}
          <div className="space-y-3.5">
            {activeQuestion.options.length > 0 ? (
              // Multiple Choice Layout
              activeQuestion.options.map((option: any, idx: number) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = activeQuestion.correctIndex === idx;
                
                // Styling matrices
                let cardStyle = "border-border-color bg-surface hover:bg-background/60 text-text-primary";
                let badgeStyle = "bg-background text-text-secondary border-border-color";

                if (isSelected) {
                  cardStyle = "border-primary bg-primary/5 ring-1 ring-primary/25";
                  badgeStyle = "bg-primary text-white border-transparent";
                }

                // Practice mode instant checks
                if (isPracticeMode && hasAnsweredCurrent) {
                  if (isCorrect) {
                    cardStyle = "border-success bg-success/5 ring-1 ring-success/20";
                    badgeStyle = "bg-success text-white border-transparent";
                  } else if (isSelected) {
                    cardStyle = "border-error bg-error/5 ring-1 ring-error/20";
                    badgeStyle = "bg-error text-white border-transparent";
                  }
                }

                // Option labels
                const labels = ["A", "B", "C", "D"];

                return (
                  <Card
                    key={option}
                    onClick={() => {
                      if (isPracticeMode && hasAnsweredCurrent) return;
                      selectAnswer(activeQuestion.id, idx);
                    }}
                    className={`cursor-pointer transition-all duration-150 border p-4.5 rounded-xl flex items-center gap-4 ${cardStyle}`}
                  >
                    <span className={`h-6 w-6 rounded-md border flex items-center justify-center font-bold text-xs select-none shrink-0 ${badgeStyle}`}>
                      {labels[idx] || idx + 1}
                    </span>
                    <span className="text-xs font-semibold leading-relaxed">
                      {option}
                    </span>
                  </Card>
                );
              })
            ) : (
              // Short Answer Layout
              <div className="space-y-4">
                <textarea
                  disabled={isPracticeMode && hasAnsweredCurrent}
                  placeholder="Type your study response here..."
                  value={shortAnswerText}
                  onChange={(e) => setShortAnswerText(e.target.value)}
                  className="w-full h-32 p-4 border border-border-color rounded-xl bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-secondary leading-relaxed resize-none"
                />

                {(!isPracticeMode || !hasAnsweredCurrent) && (
                  <Button
                    variant="primary"
                    disabled={!shortAnswerText.trim()}
                    onClick={handleShortAnswerSubmit}
                    className="px-6 h-9.5 text-xs font-semibold cursor-pointer"
                  >
                    Record Answer
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* PRACTICE MODE FEEDBACK CARD */}
          {isPracticeMode && hasAnsweredCurrent && (
            <Card className={`border p-6 rounded-xl shadow-xs space-y-4 ${
              selectedAnswer === activeQuestion.correctIndex
                ? "border-success/30 bg-success/5"
                : "border-error/30 bg-error/5"
            }`}>
              <div className="flex items-start gap-2.5">
                {selectedAnswer === activeQuestion.correctIndex ? (
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-text-primary">
                    {selectedAnswer === activeQuestion.correctIndex ? "Correct Answer!" : "Incorrect Answer"}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-normal">
                    {activeQuestion.explanation}
                  </p>
                </div>
              </div>

              {activeQuestion.pageReference && (
                <div className="border-t border-border-color/40 pt-3 flex items-center gap-1.5 text-[10px] font-bold text-text-secondary select-none">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Source: {config?.materialName || "Study Material"} &bull; Page {activeQuestion.pageReference}</span>
                </div>
              )}
            </Card>
          )}

          {/* KEYBOARD SHORTCUTS LEGEND (Desktop Only) */}
          <div className="hidden sm:flex items-center justify-center gap-2 text-[10px] font-bold text-text-secondary select-none opacity-60">
            <Keyboard className="h-3.5 w-3.5" />
            <span>Shortcut: Press [A-D] or [1-4] to select. Press [Space] to flip.</span>
          </div>

          {/* BOTTOM NAVIGATION ACTIONS */}
          <div className="border-t border-border-color/50 pt-5 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="h-9.5 px-4 text-xs font-semibold cursor-pointer border-border-color/85 hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {/* Question navigator dots container - scrollable on mobile */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-sm py-1">
              {Array.from({ length: totalQuestions }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentIdx(i);
                    const ans = userAnswers[questions[i].id];
                    setShortAnswerText(typeof ans === "string" ? ans : "");
                  }}
                  className={`h-7 w-7 rounded-md text-xs font-bold shrink-0 transition-all cursor-pointer ${getDotStyle(i)}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              onClick={handleNext}
              className="h-9.5 px-4 text-xs font-semibold cursor-pointer"
            >
              {currentIdx === totalQuestions - 1 ? "Submit Quiz" : "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        </main>
      </div>

      {/* CONFIRM EXIT DIALOG */}
      <Dialog
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="Exit active practice?"
        description="Are you sure you want to end this quiz? Your current answers and countdown progress will be lost."
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setShowExitConfirm(false)}
            className="h-9.5 text-xs font-semibold cursor-pointer border-border-color"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExitQuiz}
            className="h-9.5 text-xs font-semibold cursor-pointer bg-error hover:bg-error/90 text-white border-transparent"
          >
            Exit anyway
          </Button>
        </div>
      </Dialog>

      {/* CONFIRM SUBMIT DIALOG */}
      <Dialog
        isOpen={showSubmitConfirm}
        onClose={() => setShowSubmitConfirm(false)}
        title="Submit Quiz?"
        description={`You have answered ${
          Object.keys(userAnswers).length
        } out of ${totalQuestions} questions. ${
          questions.filter((q: any) => userAnswers[q.id] === undefined).length > 0
            ? `Warning: You still have ${
                questions.filter((q: any) => userAnswers[q.id] === undefined).length
              } unanswered questions.`
            : "Review your options or submit your answers now."
        }`}
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setShowSubmitConfirm(false)}
            className="h-9.5 text-xs font-semibold cursor-pointer border-border-color"
          >
            Continue Quiz
          </Button>
          <Button
            variant="primary"
            onClick={handleFinishSubmit}
            className="h-9.5 text-xs font-semibold cursor-pointer"
          >
            Submit Anyway
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
