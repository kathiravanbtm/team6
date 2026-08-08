"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { toast, ToastContainer } from "@/components/ui/toast";
import { AlertCircle, BrainCircuit, RefreshCw, AlertTriangle, HelpCircle, Eye, ArrowRight } from "lucide-react";

export default function MistakesCenterPage() {
  const router = useRouter();

  // Mock weak topics
  const weakConcepts = [
    { name: "Deadlocks", accuracy: 42, mistakes: 23, total: 40, color: "bg-error" },
    { name: "CPU Scheduling", accuracy: 61, mistakes: 12, total: 31, color: "bg-warning" },
    { name: "Memory Management", accuracy: 68, mistakes: 7, total: 22, color: "bg-primary" },
  ];

  // Mock recent mistakes log
  const recentMistakes = [
    {
      id: "mistake-1",
      question: "Which of the following conditions is NOT a necessary requirement for a deadlock to occur?",
      topic: "Deadlocks",
      date: "Yesterday",
      userAnswer: "Resource Preemption",
      correctAnswer: "No Preemption",
    },
    {
      id: "mistake-2",
      question: "What is thrashing in physical memory management?",
      topic: "Memory Management",
      date: "2 days ago",
      userAnswer: "A hardware collision in the cache memory line mapping",
      correctAnswer: "OS spends more time swapping pages in/out of disk than executing instructions",
    },
    {
      id: "mistake-3",
      question: "Which scheduling algorithm uses a fixed time quantum?",
      topic: "CPU Scheduling",
      date: "3 days ago",
      userAnswer: "First Come First Serve",
      correctAnswer: "Round Robin",
    },
  ];

  const handlePracticeTopic = (topicName: string) => {
    toast(`Generating AI reinforcing questions for ${topicName}...`, {
      type: "success",
      description: "Taking you to practice sheets.",
    });
    setTimeout(() => {
      router.push("/quizzes/create");
    }, 1000);
  };

  const handleLearnDifference = () => {
    toast("Loading concept comparison module...", {
      type: "info",
      description: "Explaining Deadlock Prevention vs Avoidance.",
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        <Topbar title="Your Mistakes" subtitle="Turn mistakes into mastery." />

        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8 font-sans">
          
          {/* SUMMARY STATISTICS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border border-border-color bg-surface p-5 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                Questions Missed
              </span>
              <h4 className="text-2xl font-extrabold text-text-primary mt-2">
                42
              </h4>
              <p className="text-[10px] text-text-secondary mt-1 font-semibold">
                Across all practice units
              </p>
            </Card>

            <Card className="border border-border-color bg-surface p-5 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                Concepts Needing Attention
              </span>
              <h4 className="text-2xl font-extrabold text-error mt-2">
                7
              </h4>
              <p className="text-[10px] text-text-secondary mt-1 font-semibold">
                Mastery levels below 70%
              </p>
            </Card>

            <Card className="border border-border-color bg-surface p-5 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                Improvement Rate
              </span>
              <h4 className="text-2xl font-extrabold text-success mt-2">
                +12%
              </h4>
              <p className="text-[10px] text-text-secondary mt-1 font-semibold">
                Compared to last month
              </p>
            </Card>
          </div>

          {/* AI PATTERN DETECTION WARNING */}
          <div className="flex items-start gap-4 p-5 bg-warning/5 border border-warning/15 rounded-xl text-xs leading-normal select-none">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="space-y-3.5 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div className="space-y-1">
                <span className="font-bold text-text-primary block">We noticed a pattern</span>
                <p className="text-text-secondary">
                  You frequently confuse deadlock prevention policies with deadlock avoidance criteria on operating systems tests.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleLearnDifference}
                className="h-8.5 px-4 text-[10px] font-bold cursor-pointer shrink-0 mt-2 sm:mt-0"
              >
                Learn the difference
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* WEAK CONCEPTS SECTION */}
          <div className="space-y-4">
            <h3 className="font-bold text-text-primary text-base select-none">
              Weak Concepts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {weakConcepts.map((concept) => (
                <Card key={concept.name} className="border border-border-color bg-surface p-5 rounded-xl flex flex-col justify-between hover:shadow-xs transition-shadow duration-200">
                  <div>
                    <h4 className="font-bold text-text-primary text-sm leading-snug">
                      {concept.name}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider mt-1.5">
                      <span className="text-error">{concept.accuracy}% Accuracy</span>
                      <span className="h-1 w-1 rounded-full bg-border-color" />
                      <span>{concept.mistakes} mistakes</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-3.5 border-t border-border-color/50 space-y-4">
                    <div className="space-y-1 select-none">
                      <ProgressBar value={concept.accuracy} className="h-1.5" />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handlePracticeTopic(concept.name)}
                        className="flex-1 h-8.5 text-[10px] font-semibold cursor-pointer"
                      >
                        Practice
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/quizzes/create")}
                        className="flex-1 h-8.5 text-[10px] font-semibold border-border-color/85 hover:bg-background cursor-pointer"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* RECENT MISTAKES LOG */}
          <div className="space-y-4">
            <h3 className="font-bold text-text-primary text-base select-none">
              Recent Mistakes
            </h3>

            <div className="border border-border-color bg-surface rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-border-color/65 text-text-secondary select-none font-bold">
                      <th className="p-4 font-bold">Question Details</th>
                      <th className="p-4 font-bold">Topic</th>
                      <th className="p-4 font-bold">Your Response</th>
                      <th className="p-4 font-bold">Correct Solution</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMistakes.map((item) => (
                      <tr key={item.id} className="border-b border-border-color/45 hover:bg-background/25">
                        <td className="p-4 font-medium text-text-primary max-w-xs leading-normal">
                          {item.question}
                        </td>
                        <td className="p-4 font-semibold text-text-secondary">
                          {item.topic}
                        </td>
                        <td className="p-4 font-semibold text-error/80 leading-normal">
                          {item.userAnswer}
                        </td>
                        <td className="p-4 font-semibold text-success/80 leading-normal">
                          {item.correctAnswer}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="outline"
                            onClick={() => handlePracticeTopic(item.topic)}
                            className="h-8 py-0 px-3.5 text-[10px] font-semibold border-border-color/80 hover:bg-background cursor-pointer"
                          >
                            Practice
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
