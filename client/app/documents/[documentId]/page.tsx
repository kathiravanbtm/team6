"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabOption } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Flashcard, FlashcardItem } from "@/components/learnforge/flashcard";
import { TopicBadge, DifficultyBadge } from "@/components/learnforge/badges";
import { toast, ToastContainer } from "@/components/ui/toast";
import {
  FileText,
  BrainCircuit,
  Layers,
  MoreVertical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Award,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";

// Mock topics for topic breakdown
const mockTopics = [
  { name: "Process Management", importance: "high", questions: 6, mastery: 88, color: "bg-success" },
  { name: "CPU Scheduling", importance: "high", questions: 4, mastery: 61, color: "bg-warning" },
  { name: "Deadlocks", importance: "medium", questions: 3, mastery: 42, color: "bg-error" },
  { name: "Memory Management", importance: "high", questions: 5, mastery: 68, color: "bg-primary" },
  { name: "File Systems", importance: "medium", questions: 4, mastery: 75, color: "bg-primary/80" },
  { name: "I/O Systems", importance: "low", questions: 2, mastery: 80, color: "bg-success/80" },
];

const mockFlashcards: FlashcardItem[] = [
  {
    id: "fc-1",
    front: "What is a process context switch?",
    back: "A context switch is the process of storing the state of a CPU (its context) so that it can be restored and execution resumed from the same point later. This enables multiple processes to share a single CPU resource.",
    topic: "Process Management",
  },
  {
    id: "fc-2",
    front: "What are the four necessary conditions for Deadlock?",
    back: "1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption, 4. Circular Wait. All four conditions must hold simultaneously for a deadlock to occur.",
    topic: "Deadlocks",
  },
  {
    id: "fc-3",
    front: "What is thrashing in memory management?",
    back: "Thrashing occurs when a virtual memory system spends more time swapping pages in and out of disk storage than executing actual instructions, usually due to insufficient physical RAM.",
    topic: "Memory Management",
  },
];

export default function DocumentDetailWorkspace() {
  const params = useParams();
  const router = useRouter();
  const documentId = params?.documentId as string;

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initialTab = searchParams?.get("tab") || "overview";
  const [activeTab, setActiveTab] = React.useState(initialTab);
  const [currentFcIndex, setCurrentFcIndex] = React.useState(0);
  const [flashcards, setFlashcards] = React.useState<FlashcardItem[]>(mockFlashcards);

  // Fetch real flashcards from DB on mount
  React.useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/flashcards/${documentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.flashcards && data.flashcards.length > 0) {
            setFlashcards(data.flashcards);
          }
        }
      } catch (err) {
        console.error("Failed to load flashcards:", err);
      }
    };
    if (documentId) {
      fetchCards();
    }
  }, [documentId]);

  const [isGeneratingCards, setIsGeneratingCards] = React.useState(false);

  const handleGenerateFlashcards = async () => {
    if (isGeneratingCards) return;
    setIsGeneratingCards(true);
    toast("Generating AI flashcards...", {
      type: "info",
      description: "Extracting concepts via OpenRouter LLM.",
    });

    try {
      const res = await fetch(`http://localhost:5000/api/flashcards/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: documentId,
          count: 8,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate flashcards.");
      }

      const data = await res.json();
      
      // Update local state cards list
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
      }

      toast("Flashcards generated successfully!", {
        type: "success",
        description: `Created ${data.flashcards?.length || 8} new spaced repetition cards.`,
      });
      setActiveTab("flashcards");
    } catch (err: any) {
      console.error("Flashcards generation error:", err.message);
      toast("Failed to generate flashcards", {
        type: "error",
        description: err.message,
      });
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // Tab Menu Configuration
  const tabs: TabOption[] = [
    { id: "overview", label: "Overview", icon: <FileText className="h-4 w-4" /> },
    { id: "topics", label: "Topics", icon: <Layers className="h-4 w-4" /> },
    { id: "questions", label: "Practice Questions", icon: <BrainCircuit className="h-4 w-4" /> },
    { id: "flashcards", label: "Flashcards", icon: <Layers className="h-4 w-4" /> },
    { id: "source", label: "Source Reader", icon: <BookOpen className="h-4 w-4" /> },
  ];

  // Emulated actions dropdown items
  const headerActions = [
    {
      id: "generate-quiz",
      label: "Generate Quiz",
      icon: <BrainCircuit className="h-4 w-4 text-primary" />,
      onClick: () => {
        toast("Initializing AI generation...", { type: "info" });
        setTimeout(() => router.push("/quizzes"), 1000);
      },
    },
    {
      id: "generate-cards",
      label: "Generate Flashcards",
      icon: <Layers className="h-4 w-4" />,
      onClick: () => {
        handleGenerateFlashcards();
      },
    },
  ];

  const handleFlashcardScore = (id: string, gotIt: boolean) => {
    if (gotIt) {
      toast("Marked as understood", { type: "success" });
    } else {
      toast("Rescheduled for review", { type: "info" });
    }
    setTimeout(() => {
      setCurrentFcIndex((prev) => (prev + 1) % flashcards.length);
    }, 1000);
  };

  const handleStartPractice = (topicName: string) => {
    toast(`Loading custom practices for: ${topicName}`, {
      type: "success",
      description: "Redirecting to your quiz modules.",
    });
    setTimeout(() => {
      router.push("/quizzes");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel */}
      <div className="flex flex-col flex-1 md:pl-[240px]">
        
        {/* TOPBAR */}
        <Topbar title="Study Material Workspace" />

        {/* WORKSPACE MAIN WRAPPER */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6 font-sans">
          
          {/* NAVIGATION BACK TRIGGER */}
          <div className="flex items-center">
            <Link
              href="/documents"
              className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors focus-ring rounded p-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Materials
            </Link>
          </div>

          {/* DOCUMENT HEADER BANNER */}
          <div className="bg-surface border border-border-color p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-lg border border-red-200 text-red-500 bg-red-50 flex items-center justify-center font-bold text-xs uppercase shrink-0 select-none">
                PDF
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold text-text-primary tracking-tight">
                    Operating Systems.pdf
                  </h2>
                  <Badge variant="success" className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
                    Ready
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary font-medium">
                  124 pages &bull; Extracted concept ledger active &bull; Uploaded 3 days ago
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/quizzes")}
                className="h-9.5 text-xs font-semibold cursor-pointer"
              >
                <BrainCircuit className="h-4 w-4 text-primary shrink-0" />
                Generate Quiz
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerateFlashcards}
                disabled={isGeneratingCards}
                className="h-9.5 text-xs font-semibold cursor-pointer"
              >
                {isGeneratingCards ? (
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                ) : (
                  <Layers className="h-4 w-4 shrink-0" />
                )}
                {isGeneratingCards ? "Generating..." : "Generate Flashcards"}
              </Button>
              <Dropdown
                trigger={
                  <Button variant="secondary" size="icon" className="h-9.5 w-9.5 cursor-pointer">
                    <MoreVertical className="h-4.5 w-4.5" />
                  </Button>
                }
                items={headerActions}
              />
            </div>
          </div>

          {/* TAB SYSTEM */}
          <div className="flex border-b border-border-color">
            <Tabs options={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id)} />
          </div>

          {/* TAB CONTENTS */}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              
              {/* Left Summary & Insights */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Summary Card */}
                <Card className="border border-border-color bg-surface p-6 rounded-xl">
                  <h3 className="font-bold text-text-primary text-sm mb-3">
                    Document Summary
                  </h3>
                  <div className="text-xs text-text-secondary leading-relaxed space-y-3.5">
                    <p>
                      This document serves as an advanced comprehensive text on modern **Operating Systems**. It systematically introduces kernel architectures, process synchronization mechanisms, CPU scheduling structures, memory layouts, virtual address translations, file organisations, and secure storage networks.
                    </p>
                    <p>
                      Key focus is placed on standard resource contention algorithms like **Dijkstra&apos;s Banker&apos;s algorithm** for deadlock prevention, **Round Robin & Priority** schemes for process scheduling, and **Second-Chance (Clock)** systems for physical page eviction policies.
                    </p>
                  </div>
                </Card>

                {/* Learning Insights */}
                <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-4">
                  <h3 className="font-bold text-text-primary text-sm flex items-center gap-1.5 select-none">
                    <Lightbulb className="h-4.5 w-4.5 text-primary animate-pulse" />
                    Learning Insights
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-success/5 border border-success/15 rounded-lg text-xs leading-normal">
                      <CheckCircle2 className="h-4.5 w-4.5 text-success shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-text-primary">Strength:</span>
                        <span className="text-text-secondary ml-1">
                          You&apos;re strongest in **Process Management** with an accuracy rating of 88% on diagnostic sets.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-error/5 border border-error/15 rounded-lg text-xs leading-normal">
                      <AlertTriangle className="h-4.5 w-4.5 text-error shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-text-primary text-error">Growth Opportunity:</span>
                        <span className="text-text-secondary ml-1">
                          **Deadlocks** may need more practice. Accuracy averages 42%. Try generating custom practice quizzes on this unit.
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

              </div>

              {/* Right Stats & Activity */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Stats Table */}
                <Card className="border border-border-color bg-surface p-5 rounded-xl">
                  <h3 className="font-bold text-text-primary text-sm mb-4 select-none">
                    Workspace Statistics
                  </h3>
                  <div className="space-y-3.5 text-xs text-text-secondary">
                    <div className="flex justify-between items-center">
                      <span>Total pages</span>
                      <span className="font-bold text-text-primary">124</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border-color/45 pt-3">
                      <span>Course sections</span>
                      <span className="font-bold text-text-primary">8</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border-color/45 pt-3">
                      <span>Concepts extracted</span>
                      <span className="font-bold text-text-primary">32</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border-color/45 pt-3">
                      <span>Questions generated</span>
                      <span className="font-bold text-text-primary">12</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-border-color/45 pt-3">
                      <span>Flashcards active</span>
                      <span className="font-bold text-text-primary">86</span>
                    </div>
                  </div>
                </Card>

                {/* Activity log */}
                <Card className="border border-border-color bg-surface p-5 rounded-xl">
                  <h3 className="font-bold text-text-primary text-sm mb-4 select-none">
                    Document Activity
                  </h3>
                  <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-border-color">
                    <div className="relative text-xs">
                      <span className="absolute -left-[18.5px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-surface" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-text-primary block leading-none">Completed Diagnostic Quiz</span>
                        <span className="text-[10px] text-text-secondary block">Score: 80% accuracy</span>
                        <span className="text-[9px] text-text-secondary/70 font-semibold block pt-0.5">Yesterday</span>
                      </div>
                    </div>

                    <div className="relative text-xs">
                      <span className="absolute -left-[18.5px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-surface" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-text-primary block leading-none">Reviewed 20 Flashcards</span>
                        <span className="text-[10px] text-text-secondary block">Confidence: 15 good, 5 learning</span>
                        <span className="text-[9px] text-text-secondary/70 font-semibold block pt-0.5">2 days ago</span>
                      </div>
                    </div>

                    <div className="relative text-xs">
                      <span className="absolute -left-[18.5px] top-0.5 h-2.5 w-2.5 rounded-full bg-border-color border-2 border-surface" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-text-primary block leading-none">File processed by AI</span>
                        <span className="text-[10px] text-text-secondary block">Topics index generated successfully</span>
                        <span className="text-[9px] text-text-secondary/70 font-semibold block pt-0.5">3 days ago</span>
                      </div>
                    </div>
                  </div>
                </Card>

              </div>

            </div>
          )}

          {/* TAB 2: TOPICS */}
          {activeTab === "topics" && (
            <div className="space-y-4">
              <h3 className="font-bold text-text-primary text-base select-none">
                Topic Breakdown
              </h3>
              <p className="text-xs text-text-secondary">
                Review specific subject domains, their core priorities, and accuracy matrices.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                {mockTopics.map((topic) => (
                  <Card key={topic.name} className="border border-border-color bg-surface p-5 rounded-xl hover:shadow-xs transition-shadow duration-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-text-primary text-sm leading-snug">
                          {topic.name}
                        </h4>
                        <Badge
                          variant={topic.importance === "high" ? "error" : topic.importance === "medium" ? "warning" : "success"}
                          className="text-[9px] uppercase font-bold py-0.5 px-2 tracking-wide"
                        >
                          {topic.importance} Importance
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary font-medium">
                        <span>{topic.questions} Questions</span>
                        <span className="h-1 w-1 rounded-full bg-border-color" />
                        <span>Mastery: {topic.mastery}%</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-3.5 border-t border-border-color/45 flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <ProgressBar value={topic.mastery} className="h-1.5" />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleStartPractice(topic.name)}
                        className="h-8 py-0 px-4 text-[10px] font-semibold border-border-color/80 hover:bg-background cursor-pointer shrink-0"
                      >
                        Practice Topic
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QUESTIONS */}
          {activeTab === "questions" && (
            <div className="space-y-6">
              <div className="text-center py-10 bg-surface border border-border-color rounded-xl max-w-xl mx-auto p-8 space-y-5">
                <div className="p-3.5 bg-primary/10 rounded-full text-primary w-fit mx-auto">
                  <BrainCircuit className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-text-primary text-base">
                    AI Quiz Sheet Available
                  </h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                    We have generated diagnostic practice items from your uploaded Operating Systems file. Test your understanding instantly.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => router.push("/quizzes")}
                  className="px-6 h-9.5 text-xs font-semibold cursor-pointer"
                >
                  Start Practicing
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: FLASHCARDS */}
          {activeTab === "flashcards" && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-1">
                <h3 className="font-bold text-text-primary text-base select-none">
                  Recall Cards Deck
                </h3>
                <p className="text-xs text-text-secondary">
                  Tap to flip the card, then rate your understanding.
                </p>
              </div>

              {flashcards.length > 0 ? (
                <>
                  <Flashcard
                    card={flashcards[currentFcIndex]}
                    onScore={handleFlashcardScore}
                  />

                  <div className="flex items-center justify-center gap-4 text-xs font-semibold text-text-secondary select-none">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentFcIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
                      }
                      className="h-8 px-3 cursor-pointer"
                    >
                      Previous
                    </Button>
                    <span>
                      {currentFcIndex + 1} of {flashcards.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentFcIndex((prev) => (prev + 1) % flashcards.length)}
                      className="h-8 px-3 cursor-pointer"
                    >
                      Next
                    </Button>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-border-color/30 max-w-sm mx-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const { exportFlashcardsToPdf } = await import("@/lib/utils/pdf-generator");
                        exportFlashcardsToPdf(documentId || "Study Deck", flashcards, false);
                      }}
                      className="h-8 text-[10px] font-bold border-dashed border-border-color hover:bg-background cursor-pointer"
                    >
                      📄 Export Cards (No Answers)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const { exportFlashcardsToPdf } = await import("@/lib/utils/pdf-generator");
                        exportFlashcardsToPdf(documentId || "Study Deck", flashcards, true);
                      }}
                      className="h-8 text-[10px] font-bold border-dashed border-border-color hover:bg-background cursor-pointer"
                    >
                      📄 Export Cards (With Answers)
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-xs text-text-secondary">
                  No flashcards generated for this document yet. Click &quot;Generate Flashcards&quot; at the top.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SOURCE READER */}
          {activeTab === "source" && (
            <Card className="border border-border-color bg-surface rounded-xl overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[450px]">
              {/* Left thumbnail panel */}
              <div className="md:col-span-3 border-r border-border-color bg-slate-50/50 p-4 space-y-3 select-none hidden md:block max-h-[500px] overflow-y-auto no-scrollbar">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-2">
                  Page List
                </span>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-center text-xs cursor-pointer transition-colors ${
                      idx === 0
                        ? "border-primary bg-primary/5 text-primary font-bold"
                        : "border-border-color bg-surface hover:bg-background"
                    }`}
                  >
                    <FileText className="h-4 w-4 mx-auto mb-1 opacity-70" />
                    Page {idx + 1}
                  </div>
                ))}
              </div>

              {/* Center document view */}
              <div className="md:col-span-9 p-6 flex flex-col justify-between max-h-[500px] overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-border-color/55 pb-3">
                    <span className="text-xs font-bold text-text-primary">
                      Source Reader (Page 1 of 124)
                    </span>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-bold">
                      PDF Document View
                    </Badge>
                  </div>

                  <div className="space-y-4 text-xs text-text-secondary leading-relaxed font-mono bg-background p-4 rounded-lg border border-border-color/65 overflow-x-auto select-text">
                    <p>
                      <strong>CHAPTER 1: INTRODUCTION TO PROCESS SCHEDULING</strong>
                    </p>
                    <p>
                      Operating systems allocate CPU runtime based on scheduling policies. Modern systems employ **multi-level feedback queues** to dynamically adjust process priorities based on historical CPU bursts. 
                    </p>
                    <p>
                      When a process completes its quantum slice without blocking, it is demoted to a lower priority queue. Conversely, if it yields early, it remains in a high-priority queue, ensuring high responsiveness for I/O bound systems.
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-border-color/45 flex items-center justify-between text-xs font-semibold text-text-secondary select-none">
                  <span>100% Zoom</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 px-2 cursor-pointer" disabled>
                      Prev
                    </Button>
                    <span>Page 1 / 124</span>
                    <Button variant="outline" size="sm" className="h-8 px-2 cursor-pointer">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

        </main>
      </div>
    </div>
  );
}
