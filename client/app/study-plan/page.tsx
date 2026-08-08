"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { toast, ToastContainer } from "@/components/ui/toast";
import { Calendar, CheckCircle2, Circle, Clock, Flame, Brain, ArrowRight, Lightbulb } from "lucide-react";

export default function StudyPlanPage() {
  const router = useRouter();

  // Mock weekly timeline
  const weeklyPlan = [
    { day: "Monday", topic: "Process Management", activity: "15 Flashcards", time: "10 mins", completed: true },
    { day: "Tuesday", topic: "CPU Scheduling", activity: "10 Questions Quiz", time: "15 mins", completed: true },
    { day: "Wednesday", topic: "Deadlocks Diagnostic", activity: "Error Review", time: "20 mins", completed: true },
    { day: "Thursday", topic: "Memory Segmentation", activity: "5 Practice items", time: "10 mins", completed: false },
    { day: "Friday", topic: "Virtual Memory & Swapping", activity: "Concept Summary", time: "15 mins", completed: false },
    { day: "Saturday", topic: "File Systems structures", activity: "20 Flashcards", time: "15 mins", completed: false },
    { day: "Sunday", topic: "Weekly Progress Review", activity: "Diagnostic Exam", time: "30 mins", completed: false },
  ];

  const handleStartSession = () => {
    toast("Loading today's study session...", {
      type: "success",
      description: "Opening custom Deadlocks practice sheet.",
    });
    setTimeout(() => {
      router.push("/quizzes/create");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        <Topbar title="Your Study Plan" subtitle="Your next steps, based on what you know." />

        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          {/* LEFT: WEEKLY TIMELINE */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border border-border-color bg-surface p-6 rounded-xl">
              <h3 className="font-bold text-text-primary text-sm mb-5 select-none">
                Weekly Study Timeline
              </h3>

              <div className="space-y-4">
                {weeklyPlan.map((dayPlan) => (
                  <div
                    key={dayPlan.day}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                      dayPlan.completed
                        ? "bg-slate-50/40 border-border-color/60 opacity-75"
                        : "bg-surface border-border-color hover:bg-slate-50/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {dayPlan.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-text-secondary/60 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">
                            {dayPlan.day}
                          </span>
                          <span className="text-[10px] text-text-secondary font-semibold">
                            {dayPlan.topic}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary">
                          {dayPlan.activity} &bull; {dayPlan.time} estimated
                        </p>
                      </div>
                    </div>

                    {!dayPlan.completed && (
                      <Button
                        variant="secondary"
                        onClick={() => router.push("/quizzes/create")}
                        className="h-8 py-0 px-3.5 text-[10px] font-semibold cursor-pointer shrink-0"
                      >
                        Start
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* RIGHT: TODAY'S GOAL & AI RECOMMENDATION */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Today's Goal Card */}
            <Card className="border border-border-color bg-surface p-6 rounded-xl relative overflow-hidden shadow-xs">
              {/* background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-5">
                <div className="flex justify-between items-center select-none">
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold">
                    Today&apos;s Focus
                  </Badge>
                  <Flame className="h-4.5 w-4.5 text-primary animate-pulse" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-extrabold text-text-primary text-base">
                    Review Deadlocks
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-text-secondary font-semibold">
                    <span className="flex items-center gap-1">
                      <Brain className="h-3.5 w-3.5" /> 30 questions
                    </span>
                    <span className="h-1 w-1 rounded-full bg-border-color" />
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> 20 mins
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  onClick={handleStartSession}
                  className="w-full h-10 text-xs font-bold shadow-sm cursor-pointer"
                >
                  Start Session
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* AI Recommendation Alert */}
            <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-4">
              <h4 className="font-bold text-text-primary text-xs flex items-center gap-1.5 select-none">
                <Lightbulb className="h-4.5 w-4.5 text-primary" />
                AI Planner Insight
              </h4>
              <p className="text-xs text-text-secondary leading-normal font-medium">
                Based on your recent incorrect answers on diagnostic sets, spend more time studying **deadlock avoidance** criteria rather than prevention techniques.
              </p>
            </Card>

            {/* Progress Goals Card */}
            <Card className="border border-border-color bg-surface p-5 rounded-xl space-y-4">
              <h4 className="font-bold text-text-primary text-xs select-none">
                Weekly Session Goal
              </h4>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-text-secondary select-none">
                  <span>3 / 7 Days completed</span>
                  <span>42%</span>
                </div>
                <ProgressBar value={42} />
              </div>
            </Card>

          </div>

        </main>
      </div>
    </div>
  );
}
