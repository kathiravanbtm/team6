"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/services/quiz";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from "@/components/ui/toast";
import { motion } from "framer-motion";
import {
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Eye,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.quizId as string;

  // Zustand Store
  const config = useQuizStore((state: any) => state.config);
  const questions = useQuizStore((state: any) => state.questions);
  const userAnswers = useQuizStore((state: any) => state.userAnswers);
  const timeRemaining = useQuizStore((state: any) => state.timeRemaining);
  const resetQuiz = useQuizStore((state: any) => state.resetQuiz);
  const startQuiz = useQuizStore((state: any) => state.startQuiz);

  // Fallback defaults if store is empty (e.g. direct url hits)
  const isStoreEmpty = questions.length === 0;
  const activeQuestions = isStoreEmpty ? [] : questions;
  const activeAnswers = isStoreEmpty ? {} : userAnswers;

  // Calculate results
  let correctCount = 0;
  activeQuestions.forEach((q: any) => {
    if (activeAnswers[q.id] === q.correctIndex) {
      correctCount += 1;
    }
  });

  const totalCount = activeQuestions.length || 5;
  const finalScore = isStoreEmpty ? 80 : Math.round((correctCount / totalCount) * 100);
  const finalCorrect = isStoreEmpty ? 4 : correctCount;

  // Calculate time elapsed
  const totalAllocatedTime = totalCount * 60;
  const timeSpentSecs = isStoreEmpty ? 245 : Math.max(totalAllocatedTime - timeRemaining, 10);
  const formatTimeSpent = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}m ${remaining}s`;
  };

  // Performance calculations
  const topicAccuracy: Record<string, { correct: number; total: number }> = {};
  const difficultyAccuracy: Record<string, { correct: number; total: number }> = {};

  if (!isStoreEmpty) {
    questions.forEach((q: any) => {
      // Topics
      if (!topicAccuracy[q.topic]) topicAccuracy[q.topic] = { correct: 0, total: 0 };
      topicAccuracy[q.topic].total += 1;
      if (userAnswers[q.id] === q.correctIndex) {
        topicAccuracy[q.topic].correct += 1;
      }

      // Difficulty
      if (!difficultyAccuracy[q.difficulty]) difficultyAccuracy[q.difficulty] = { correct: 0, total: 0 };
      difficultyAccuracy[q.difficulty].total += 1;
      if (userAnswers[q.id] === q.correctIndex) {
        difficultyAccuracy[q.difficulty].correct += 1;
      }
    });
  } else {
    // Mock fallbacks
    topicAccuracy["Process Management"] = { correct: 2, total: 2 };
    topicAccuracy["CPU Scheduling"] = { correct: 1, total: 2 };
    topicAccuracy["Deadlocks"] = { correct: 1, total: 1 };

    difficultyAccuracy["easy"] = { correct: 1, total: 1 };
    difficultyAccuracy["medium"] = { correct: 2, total: 3 };
    difficultyAccuracy["hard"] = { correct: 1, total: 1 };
  }

  const handlePracticeWeakTopics = () => {
    toast("Generating custom recovery quiz...", {
      type: "success",
      description: "Focusing on CPU Scheduling and Deadlocks (mastery below 70%).",
    });
    setTimeout(() => {
      router.push("/quizzes/create");
    }, 1000);
  };

  const handleRetry = () => {
    if (!isStoreEmpty) {
      startQuiz(quizId, questions, config?.mode || "practice");
      router.push(`/quizzes/${quizId}`);
    } else {
      router.push("/quizzes/create");
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        <Topbar title="Quiz Results" />

        <main className="flex-1 p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6 sm:space-y-8 font-sans">
          
          {/* RESULT HERO BANNER */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            <Card className="border border-border-color bg-surface rounded-2xl overflow-hidden shadow-xs relative text-center">
              {/* Subtle background spark effect */}
              <div className="absolute inset-0 bg-primary/[0.02] pointer-events-none" />
              
              <CardContent className="p-8 sm:p-10 space-y-6 flex flex-col items-center">
                <div className="p-4 bg-primary/10 rounded-full text-primary w-fit animate-bounce">
                  <Award className="h-10 w-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                    Quiz Complete
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
                    {finalScore}%
                  </h2>
                  <p className="text-xs text-text-secondary font-medium">
                    {finalCorrect} of {totalCount} questions correct &bull; {formatTimeSpent(timeSpentSecs)} elapsed
                  </p>
                </div>

                {/* Score feedback tag */}
                <Badge variant={finalScore >= 80 ? "success" : finalScore >= 60 ? "warning" : "error"} className="px-4 py-1 rounded-full text-xs font-bold tracking-wide uppercase select-none">
                  {finalScore >= 80 ? "Excellent Mastery" : finalScore >= 60 ? "Passing Progress" : "Requires Review"}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* TWO COLUMN PERFORMANCE BREAKDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* LEFT: TOPIC & DIFFICULTY MATRIX */}
            <div className="space-y-6">
              
              {/* Topic performance list */}
              <Card className="border border-border-color bg-surface p-5 rounded-xl space-y-4">
                <h3 className="font-bold text-text-primary text-sm border-b border-border-color/45 pb-3 select-none">
                  Performance by Topic
                </h3>
                <div className="space-y-4">
                  {Object.entries(topicAccuracy).map(([topic, data]) => {
                    const accuracy = Math.round((data.correct / data.total) * 100);
                    return (
                      <div key={topic} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-text-primary">{topic}</span>
                          <span className="text-text-secondary">{accuracy}% ({data.correct}/{data.total})</span>
                        </div>
                        <ProgressBar value={accuracy} className={accuracy < 70 ? "bg-error/10 text-error" : "bg-primary/10"} />
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Difficulty accuracy */}
              <Card className="border border-border-color bg-surface p-5 rounded-xl space-y-4">
                <h3 className="font-bold text-text-primary text-sm border-b border-border-color/45 pb-3 select-none">
                  Performance by Difficulty
                </h3>
                <div className="space-y-4">
                  {Object.entries(difficultyAccuracy).map(([diff, data]) => {
                    const accuracy = Math.round((data.correct / data.total) * 100);
                    return (
                      <div key={diff} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-text-primary capitalize">{diff}</span>
                          <span className="text-text-secondary">{accuracy}% ({data.correct}/{data.total})</span>
                        </div>
                        <ProgressBar value={accuracy} />
                      </div>
                    );
                  })}
                </div>
              </Card>

            </div>

            {/* RIGHT: AI INSIGHTS & ACTIONS */}
            <div className="space-y-6">
              
              {/* AI Insights Card */}
              <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-5">
                <h3 className="font-bold text-text-primary text-sm flex items-center gap-1.5 select-none">
                  <Lightbulb className="h-4.5 w-4.5 text-primary animate-pulse" />
                  AI Tutor Insights
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-text-primary block">Your strongest area</span>
                      <p className="text-text-secondary mt-0.5 leading-relaxed">
                        You&apos;re doing very well with **Process Management**, keeping a perfect 100% correct rate.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-text-primary block">Area to improve</span>
                      <p className="text-text-secondary mt-0.5 leading-relaxed">
                        Your answers suggest you may be confusing deadlock prevention and deadlock avoidance structures.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recommended Next Actions */}
              <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-4">
                <h3 className="font-bold text-text-primary text-sm select-none">
                  Recommended Next Steps
                </h3>

                <div className="space-y-3">
                  <Button
                    variant="primary"
                    onClick={handlePracticeWeakTopics}
                    className="w-full h-10.5 text-xs font-bold shadow-sm cursor-pointer justify-between"
                  >
                    <span>Practice Weak Topics (Deadlocks)</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/quizzes/${quizId}/review`)}
                      className="h-9.5 text-xs font-bold border-border-color/85 hover:bg-background cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      Review Answers
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRetry}
                      className="h-9.5 text-xs font-bold border-border-color/85 hover:bg-background cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry Quiz
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border-color/30 mt-3">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const { exportQuizToPdf } = await import("@/lib/utils/pdf-generator");
                        exportQuizToPdf(
                          config?.title || "LearnForge Quiz",
                          activeQuestions.map((q: any) => ({
                            question: q.questionText || q.question_text || q.question,
                            options: q.options,
                            correctIndex: q.correctIndex,
                            explanation: q.explanation
                          })),
                          false
                        );
                      }}
                      className="h-9 text-[10px] font-bold border-dashed border-border-color/90 hover:bg-background cursor-pointer"
                    >
                      📄 Export Quiz (No Answers)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const { exportQuizToPdf } = await import("@/lib/utils/pdf-generator");
                        exportQuizToPdf(
                          config?.title || "LearnForge Quiz",
                          activeQuestions.map((q: any) => ({
                            question: q.questionText || q.question_text || q.question,
                            options: q.options,
                            correctIndex: q.correctIndex,
                            explanation: q.explanation
                          })),
                          true
                        );
                      }}
                      className="h-9 text-[10px] font-bold border-dashed border-border-color/90 hover:bg-background cursor-pointer"
                    >
                      📄 Export Quiz (With Answers)
                    </Button>
                  </div>
                </div>
              </Card>

            </div>

          </div>

          {/* BACK TO DASHBOARD SHORTCUT */}
          <div className="flex justify-center pt-4 select-none">
            <Button
              variant="outline"
              onClick={() => {
                resetQuiz();
                router.push("/dashboard");
              }}
              className="px-8 h-10 text-xs font-semibold border-border-color/85 hover:bg-background cursor-pointer"
            >
              Back to Dashboard
            </Button>
          </div>

        </main>
      </div>
    </div>
  );
}
