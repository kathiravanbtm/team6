"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuizStore, QuizQuestion } from "@/lib/services/quiz";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from "@/components/ui/toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  AlertTriangle,
  Lightbulb,
  Loader2,
} from "lucide-react";

export default function QuestionReviewPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.quizId as string;

  // Zustand Store
  const config = useQuizStore((state: any) => state.config);
  const questions = useQuizStore((state: any) => state.questions);
  const userAnswers = useQuizStore((state: any) => state.userAnswers);

  const [activeIdx, setActiveIdx] = React.useState(0);

  // Fallback check if store is empty
  const isStoreEmpty = questions.length === 0;
  const activeQuestions = isStoreEmpty
    ? [
        {
          id: "q-1",
          question: "Which scheduling algorithm uses a fixed time quantum to allocate CPU runtime to processes?",
          options: ["First Come First Serve", "Shortest Job First", "Round Robin", "Priority Scheduling"],
          correctIndex: 2,
          explanation: "Round Robin scheduling uses a fixed time quantum to ensure all processes share the CPU resource equitably.",
          topic: "CPU Scheduling",
          difficulty: "medium",
          pageReference: 42,
        },
        {
          id: "q-2",
          question: "Which of the following conditions is NOT a necessary requirement for a deadlock to occur?",
          options: ["Mutual Exclusion", "Hold and Wait", "Resource Preemption", "Circular Wait"],
          correctIndex: 2,
          explanation: "Deadlocks require NO preemption. If resources can be preempted, deadlocked states can be resolved.",
          topic: "Deadlocks",
          difficulty: "medium",
          pageReference: 83,
        },
      ]
    : questions;

  const activeAnswers = isStoreEmpty ? { "q-1": 1, "q-2": 2 } : userAnswers;

  const currentQuestion = activeQuestions[activeIdx];
  const totalQuestions = activeQuestions.length;

  if (totalQuestions === 0 || !currentQuestion) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center font-sans">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  const selectedAnswer = activeAnswers[currentQuestion.id];
  const isCorrect = selectedAnswer === currentQuestion.correctIndex;

  // Pattern detection: count incorrect answers
  const incorrectCount = activeQuestions.filter(
    (q: any) => activeAnswers[q.id] !== q.correctIndex
  ).length;

  const handlePracticeConcept = (concept: string) => {
    toast(`Generating customized practice for ${concept}...`, {
      type: "success",
      description: "Redirecting to your builder workspace.",
    });
    setTimeout(() => {
      router.push("/quizzes/create");
    }, 1000);
  };

  const handleNext = () => {
    if (activeIdx < totalQuestions - 1) setActiveIdx((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (activeIdx > 0) setActiveIdx((prev) => prev - 1);
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        <Topbar title="Question Review" />

        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6 font-sans">
          
          {/* TOP BACK ACTION */}
          <div className="flex items-center">
            <button
              onClick={() => router.push(`/quizzes/${quizId}/results`)}
              className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus:outline-none"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Results
            </button>
          </div>

          {/* DESKTOP SPLIT COLUMN VIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: QUESTION NAVIGATOR */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border border-border-color bg-surface p-4 rounded-xl max-h-[400px] overflow-y-auto no-scrollbar">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-3.5 select-none">
                  Questions List
                </span>

                <div className="space-y-2">
                  {activeQuestions.map((q: any, idx: number) => {
                    const ans = activeAnswers[q.id];
                    const correct = ans === q.correctIndex;
                    const isActive = idx === activeIdx;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setActiveIdx(idx)}
                        className={`w-full p-3 rounded-lg border text-left text-xs transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer focus:outline-none ${
                          isActive
                            ? "border-primary bg-primary/5 font-semibold"
                            : "border-border-color bg-surface hover:bg-background"
                        }`}
                      >
                        <span className="truncate max-w-[150px]">
                          {idx + 1}. {q.question}
                        </span>
                        {correct ? (
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-error shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Pattern Alert card */}
              {incorrectCount >= 1 && (
                <Card className="border border-warning/20 bg-warning/5 p-4 rounded-xl space-y-3.5 select-none">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4.5 w-4.5 text-warning shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-xs text-text-primary">
                        Pattern detected
                      </span>
                      <p className="text-[10px] text-text-secondary leading-normal">
                        You missed {incorrectCount} questions related to core resource allocation concepts.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handlePracticeConcept("Deadlock Avoidance")}
                    className="w-full h-8 text-[10px] font-bold cursor-pointer"
                  >
                    Practice this concept
                  </Button>
                </Card>
              )}

            </div>

            {/* RIGHT COLUMN: QUESTION DETAILS */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Question Sheet card */}
              <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center select-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Question {activeIdx + 1} of {totalQuestions}
                  </span>
                  <Badge variant={isCorrect ? "success" : "error"} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                </div>

                <h3 className="font-bold text-text-primary text-base leading-snug">
                  {currentQuestion.question}
                </h3>

                {/* Option list */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((option: any, idx: number) => {
                    const isUserChoice = selectedAnswer === idx;
                    const isCorrectChoice = currentQuestion.correctIndex === idx;

                    let rowStyle = "border-border-color bg-surface text-text-secondary opacity-80";
                    let badgeStyle = "bg-background text-text-secondary border-border-color";

                    if (isCorrectChoice) {
                      rowStyle = "border-success bg-success/5 text-success font-semibold opacity-100";
                      badgeStyle = "bg-success text-white border-transparent";
                    } else if (isUserChoice) {
                      rowStyle = "border-error bg-error/5 text-error font-semibold opacity-100";
                      badgeStyle = "bg-error text-white border-transparent";
                    }

                    const labels = ["A", "B", "C", "D"];

                    return (
                      <div
                        key={option}
                        className={`border p-3.5 rounded-lg flex items-center gap-3.5 text-xs ${rowStyle}`}
                      >
                        <span className={`h-5.5 w-5.5 rounded-md border flex items-center justify-center font-bold text-[10px] select-none shrink-0 ${badgeStyle}`}>
                          {labels[idx] || idx + 1}
                        </span>
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* AI Explanation details card */}
              <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-4">
                <h4 className="font-bold text-text-primary text-xs flex items-center gap-1.5 select-none">
                  <Lightbulb className="h-4.5 w-4.5 text-primary" />
                  AI Explanation & Critique
                </h4>

                <div className="space-y-3.5 text-xs leading-normal">
                  <p className="text-text-secondary">
                    {currentQuestion.explanation}
                  </p>

                  {!isCorrect && (
                    <div className="p-3.5 bg-error/5 border border-error/15 rounded-lg">
                      <span className="font-bold text-error block">Why your answer was incorrect:</span>
                      <p className="text-text-secondary mt-1">
                        You selected option {selectedAnswer !== undefined ? String.fromCharCode(65 + (selectedAnswer as number)) : "None"}, which is incorrect. FCFS or SJF scheduling fails to dynamically preempt processes, leading to starvation or convoy effects that a time quantum avoids.
                      </p>
                    </div>
                  )}
                </div>

                {/* Source marker */}
                {currentQuestion.pageReference && (
                  <div className="border-t border-border-color/40 pt-4 flex items-center gap-1.5 text-[10px] font-bold text-text-secondary select-none">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Source: {config?.materialName || "Operating Systems.pdf"} &bull; Page {currentQuestion.pageReference} &bull; Topic: {currentQuestion.topic}</span>
                  </div>
                )}
              </Card>

              {/* Navigator buttons */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={activeIdx === 0}
                  className="h-9.5 text-xs font-semibold cursor-pointer border-border-color/85 hover:bg-background"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Question
                </Button>

                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={activeIdx === totalQuestions - 1}
                  className="h-9.5 text-xs font-semibold cursor-pointer border-border-color/85 hover:bg-background"
                >
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
