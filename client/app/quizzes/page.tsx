"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { SearchInput } from "@/components/ui/search-input";
import { Dialog } from "@/components/ui/dialog";
import { Dropdown } from "@/components/ui/dropdown";
import { TopicBadge, DifficultyBadge } from "@/components/learnforge/badges";
import { toast, ToastContainer } from "@/components/ui/toast";
import { useQuizStore } from "@/lib/services/quiz";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Play,
  Eye,
  Trash2,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  Award,
  BookOpen,
  AlertTriangle,
  MoreVertical,
  RotateCcw,
  Sparkles,
  Flame,
  ChevronDown,
  BrainCircuit,
} from "lucide-react";

export interface QuizModel {
  id: string;
  title: string;
  sourceDocument: string;
  topics: string[];
  questionCount: number;
  difficulty: "easy" | "medium" | "hard" | "adaptive";
  status: "not_started" | "in_progress" | "completed";
  progress: number; // questions completed
  score?: number; // percentage correct
  estimatedMinutes: number;
  createdAt: string;
  recommended?: boolean;
  recommendationReason?: string;
  mode: "practice" | "exam";
}

const mockQuizzesList: QuizModel[] = [
  {
    id: "quiz-1",
    title: "Operating Systems — CPU Scheduling",
    sourceDocument: "Operating Systems.pdf",
    topics: ["CPU Scheduling"],
    questionCount: 20,
    difficulty: "medium",
    status: "in_progress",
    progress: 12,
    estimatedMinutes: 15,
    createdAt: "Today, 10:42 AM",
    recommended: true,
    recommendationReason: "You missed 3 scheduling questions on yesterday's review.",
    mode: "practice",
  },
  {
    id: "quiz-2",
    title: "Deadlock Essentials",
    sourceDocument: "Operating Systems.pdf",
    topics: ["Deadlocks"],
    questionCount: 10,
    difficulty: "adaptive",
    status: "not_started",
    progress: 0,
    estimatedMinutes: 8,
    createdAt: "Yesterday",
    recommended: true,
    recommendationReason: "You've missed several questions related to deadlock avoidance.",
    mode: "exam",
  },
  {
    id: "quiz-3",
    title: "DBMS Normalization & Relational Algebra",
    sourceDocument: "DBMS_Lecture_Notes.docx",
    topics: ["Normalization"],
    questionCount: 20,
    difficulty: "medium",
    status: "completed",
    progress: 20,
    score: 85,
    estimatedMinutes: 15,
    createdAt: "2 hours ago",
    mode: "practice",
  },
  {
    id: "quiz-4",
    title: "Computer Networks — TCP/IP Congestion",
    sourceDocument: "Computer Networks.pdf",
    topics: ["TCP/IP"],
    questionCount: 15,
    difficulty: "hard",
    status: "completed",
    progress: 15,
    score: 60,
    estimatedMinutes: 12,
    createdAt: "Yesterday",
    mode: "exam",
  },
  {
    id: "quiz-5",
    title: "DSA Binary Search Trees",
    sourceDocument: "Data Structures & Algorithms.docx",
    topics: ["Binary Trees"],
    questionCount: 10,
    difficulty: "easy",
    status: "not_started",
    progress: 0,
    estimatedMinutes: 10,
    createdAt: "3 days ago",
    mode: "practice",
  },
  {
    id: "quiz-6",
    title: "Operating Systems — Process Synchronization",
    sourceDocument: "Operating Systems.pdf",
    topics: ["Process Management"],
    questionCount: 10,
    difficulty: "medium",
    status: "completed",
    progress: 10,
    score: 90,
    estimatedMinutes: 10,
    createdAt: "5 days ago",
    mode: "practice",
  },
];

export default function QuizzesLibraryPage() {
  const router = useRouter();
  const resetQuiz = useQuizStore((state: any) => state.resetQuiz);

  // Core state arrays
  const [quizzes, setQuizzes] = React.useState<QuizModel[]>(mockQuizzesList);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSort, setSelectedSort] = React.useState<"Recent" | "Oldest" | "Highest Score" | "Lowest Score" | "Most Questions">("Recent");
  
  // Filter Modal controls
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [filterStatus, setFilterStatus] = React.useState<string>("All");
  const [filterDifficulty, setFilterDifficulty] = React.useState<string>("All");
  const [filterSource, setFilterSource] = React.useState<string>("All");
  const [filterScore, setFilterScore] = React.useState<string>("All");

  // Delete Confirmation Modal controls
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [quizToDeleteId, setQuizToDeleteId] = React.useState<string | null>(null);

  // Pagination states
  const [visibleCount, setVisibleCount] = React.useState(6);

  // Actions
  const handleCreateQuiz = () => {
    router.push("/quizzes/create");
  };

  const handleStartQuiz = (quizId: string) => {
    toast("Loading active practice session...", { type: "info" });
    setTimeout(() => {
      router.push(`/quizzes/${quizId}`);
    }, 800);
  };

  const handleReviewResults = (quizId: string) => {
    router.push(`/quizzes/${quizId}/results`);
  };

  const handleRetakeQuiz = (quizId: string) => {
    resetQuiz();
    toast("Initializing retake sheet...", { type: "success" });
    setTimeout(() => {
      router.push(`/quizzes/${quizId}`);
    }, 800);
  };

  const handleOpenDelete = (id: string) => {
    setQuizToDeleteId(id);
    setIsDeleteOpen(true);
  };

  const confirmDeleteQuiz = () => {
    if (!quizToDeleteId) return;
    const deletedQuiz = quizzes.find((q) => q.id === quizToDeleteId);
    setQuizzes((prev) => prev.filter((q) => q.id !== quizToDeleteId));
    setIsDeleteOpen(false);
    setQuizToDeleteId(null);
    toast(`Deleted quiz: "${deletedQuiz?.title}"`, {
      type: "info",
      description: "Quiz removed from library. Analytics remained intact.",
    });
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
    toast("Applied active filters", { type: "success" });
  };

  const clearFilters = () => {
    setFilterStatus("All");
    setFilterDifficulty("All");
    setFilterSource("All");
    setFilterScore("All");
    setIsFilterOpen(false);
    toast("Filters cleared", { type: "info" });
  };

  // Filter & Sort Logic
  const filteredAndSortedQuizzes = quizzes
    .filter((q) => {
      // Search matches
      const matchesSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.sourceDocument.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status match
      let matchesStatus = true;
      if (filterStatus !== "All") {
        matchesStatus = q.status === filterStatus.toLowerCase().replace(" ", "_");
      }

      // Difficulty match
      let matchesDifficulty = true;
      if (filterDifficulty !== "All") {
        matchesDifficulty = q.difficulty === filterDifficulty.toLowerCase();
      }

      // Source match
      let matchesSource = true;
      if (filterSource !== "All") {
        matchesSource = q.sourceDocument.includes(filterSource);
      }

      // Score range match
      let matchesScore = true;
      if (filterScore !== "All" && q.score !== undefined) {
        if (filterScore === "Below 50%") matchesScore = q.score < 50;
        if (filterScore === "50–70%") matchesScore = q.score >= 50 && q.score <= 70;
        if (filterScore === "70–90%") matchesScore = q.score >= 70 && q.score <= 90;
        if (filterScore === "90%+") matchesScore = q.score >= 90;
      } else if (filterScore !== "All" && q.score === undefined) {
        matchesScore = false;
      }

      return matchesSearch && matchesStatus && matchesDifficulty && matchesSource && matchesScore;
    })
    .sort((a, b) => {
      if (selectedSort === "Highest Score") return (b.score || 0) - (a.score || 0);
      if (selectedSort === "Lowest Score") return (a.score || 0) - (b.score || 0);
      if (selectedSort === "Most Questions") return b.questionCount - a.questionCount;
      if (selectedSort === "Oldest") return a.id.localeCompare(b.id);
      return b.id.localeCompare(a.id); // Recent (default)
    });

  const inProgressQuizzes = quizzes.filter((q) => q.status === "in_progress");
  const recommendedQuizzes = quizzes.filter((q) => q.recommended === true);

  const sortItems = [
    { id: "Recent", label: "Recently Created", onClick: () => setSelectedSort("Recent") },
    { id: "Oldest", label: "Oldest First", onClick: () => setSelectedSort("Oldest") },
    { id: "Highest", label: "Highest Score", onClick: () => setSelectedSort("Highest Score") },
    { id: "Lowest", label: "Lowest Score", onClick: () => setSelectedSort("Lowest Score") },
    { id: "Most", label: "Most Questions", onClick: () => setSelectedSort("Most Questions") },
  ];

  const getCardActions = (quiz: QuizModel) => [
    ...(quiz.status === "in_progress"
      ? [
          {
            id: "continue",
            label: "Continue Quiz",
            icon: <Play className="h-4 w-4 text-primary" />,
            onClick: () => handleStartQuiz(quiz.id),
          },
        ]
      : []),
    ...(quiz.status === "completed"
      ? [
          {
            id: "review",
            label: "Review Results",
            icon: <Eye className="h-4 w-4 text-primary" />,
            onClick: () => handleReviewResults(quiz.id),
          },
        ]
      : []),
    {
      id: "retry",
      label: "Retry Quiz",
      icon: <RotateCcw className="h-4 w-4" />,
      onClick: () => handleRetakeQuiz(quiz.id),
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      onClick: () => handleOpenDelete(quiz.id),
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Decorative premium glow gradients */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-[240px] w-[350px] h-[350px] bg-indigo-500/[0.015] rounded-full blur-3xl pointer-events-none" />

      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        {/* TOPBAR */}
        <Topbar title="Quizzes" subtitle="Practice what you've learned and turn knowledge into mastery." />

        {/* WORKSPACE CONTENT FRAME */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8 font-sans z-10">
          
          {/* HEADER ROW WITH ACTION BUTTONS */}
          <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border-color/45 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1 select-none">
                <Flame className="h-3 w-3 animate-pulse" />
                Practice Workspace
              </span>
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                Quiz Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3 select-none">
              <Button
                variant="outline"
                onClick={() => router.push("/documents")}
                className="h-10 text-xs font-semibold border-border-color/85 hover:bg-background cursor-pointer"
              >
                Quick Practice
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateQuiz}
                className="h-10 text-xs font-bold shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4 shrink-0" />
                Create Quiz
              </Button>
            </div>
          </div>

          {/* QUICK STATS ROW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-surface border border-border-color/80 p-4.5 rounded-xl flex items-center justify-between shadow-xs hover:border-primary/30 transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Total Quizzes
                </span>
                <span className="text-xl font-extrabold text-text-primary block leading-none">
                  24
                </span>
              </div>
              <div className="p-2 bg-primary/5 rounded-lg text-primary">
                <BrainCircuit className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-surface border border-border-color/80 p-4.5 rounded-xl flex items-center justify-between shadow-xs hover:border-success/30 transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Completed
                </span>
                <span className="text-xl font-extrabold text-success block leading-none">
                  18
                </span>
              </div>
              <div className="p-2 bg-success/5 rounded-lg text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-surface border border-border-color/80 p-4.5 rounded-xl flex items-center justify-between shadow-xs hover:border-amber-500/30 transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  Average Score
                </span>
                <span className="text-xl font-extrabold text-text-primary block leading-none">
                  78%
                </span>
                <span className="text-[9px] text-success font-semibold block pt-0.5">+6% this month</span>
              </div>
              <div className="p-2 bg-amber-500/[0.03] rounded-lg text-amber-500">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-surface border border-border-color/80 p-4.5 rounded-xl flex items-center justify-between shadow-xs hover:border-warning/30 transition-all duration-300">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                  In Progress
                </span>
                <span className="text-xl font-extrabold text-warning block leading-none">
                  3
                </span>
              </div>
              <div className="p-2 bg-warning/[0.03] rounded-lg text-warning">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* CONTINUE LEARNING SECTION */}
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-text-primary text-base select-none">
                Continue Learning
              </h3>
              <p className="text-xs text-text-secondary">
                Pick up where you left off.
              </p>
            </div>

            {inProgressQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {inProgressQuizzes.map((quiz) => {
                  const progressPct = Math.round((quiz.progress / quiz.questionCount) * 100);
                  return (
                    <Card
                      key={quiz.id}
                      hoverLift
                      className="border border-border-color/90 bg-surface/90 p-6 rounded-xl flex flex-col justify-between min-h-[220px] shadow-xs relative overflow-hidden group hover:border-primary/45"
                    >
                      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-primary/5 to-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-text-secondary block">
                              In Progress
                            </span>
                            <h4 className="font-bold text-text-primary text-sm leading-snug group-hover:text-primary transition-colors">
                              {quiz.title}
                            </h4>
                          </div>
                          
                          <Dropdown
                            trigger={
                              <button className="p-1.5 hover:bg-background rounded-lg border border-transparent hover:border-border-color transition-colors cursor-pointer text-text-secondary">
                                <MoreVertical className="h-4.5 w-4.5" />
                              </button>
                            }
                            items={getCardActions(quiz)}
                          />
                        </div>

                        <div className="space-y-1.5 select-none">
                          <div className="flex justify-between text-[11px] font-bold text-text-secondary">
                            <span>{quiz.progress} / {quiz.questionCount} questions</span>
                            <span>{progressPct}% Completed</span>
                          </div>
                          <ProgressBar value={progressPct} className="h-1.5 bg-border-color/45" />
                        </div>
                      </div>

                      <div className="mt-6 pt-3.5 border-t border-border-color/50 flex items-center justify-between gap-4 flex-wrap text-[10px] text-text-secondary font-semibold">
                        <span>Last attempted {quiz.createdAt}</span>

                        <Button
                          variant="secondary"
                          onClick={() => handleStartQuiz(quiz.id)}
                          className="h-8.5 py-0 px-4 text-[10px] font-bold cursor-pointer shrink-0 shadow-xs hover:bg-primary hover:text-white transition-all duration-300"
                        >
                          Continue Quiz
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-border-color rounded-xl bg-surface/50 text-center select-none text-xs text-text-secondary font-semibold">
                You&apos;re all caught up. Start a new quiz to keep learning.
              </div>
            )}
          </div>

          {/* AI RECOMMENDED PRACTICE */}
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-text-primary text-base flex items-center gap-1.5 select-none">
                <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                Recommended for You
              </h3>
              <p className="text-xs text-text-secondary">
                Based on your recent performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {recommendedQuizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  hoverLift
                  className="border border-border-color/90 bg-gradient-to-b from-surface to-background/50 p-6 rounded-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden group hover:border-primary/40"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.04] rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                          <Sparkles className="h-2.5 w-2.5" />
                          AI Recommendation
                        </span>
                        <h4 className="font-bold text-text-primary text-sm leading-snug pt-1.5 group-hover:text-primary transition-colors">
                          {quiz.title}
                        </h4>
                      </div>
                      
                      <DifficultyBadge difficulty={quiz.difficulty} />
                    </div>

                    {quiz.recommendationReason && (
                      <div className="text-[11px] text-text-secondary leading-relaxed bg-primary/[0.02] border border-primary/5 p-3 rounded-lg select-none">
                        💡 {quiz.recommendationReason}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-3.5 border-t border-border-color/50 flex items-center justify-between gap-4 flex-wrap text-[10px] text-text-secondary font-semibold">
                    <span>{quiz.questionCount} Questions &bull; ~{quiz.estimatedMinutes} mins</span>

                    <Button
                      variant="primary"
                      onClick={() => handleStartQuiz(quiz.id)}
                      className="h-8.5 py-0 px-4.5 text-[10px] font-bold cursor-pointer shrink-0 shadow-sm"
                    >
                      Practice Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* ALL QUIZZES CATALOG */}
          <div className="space-y-5 pt-4">
            
            {/* Catalog header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border-color p-4 rounded-xl shadow-xs">
              <div className="flex-1 max-w-md">
                <SearchInput
                  placeholder="Search quizzes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery("")}
                  className="h-10 text-xs"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
                {/* Filter dialog trigger */}
                <Button
                  variant="outline"
                  onClick={() => setIsFilterOpen(true)}
                  className="h-10 text-xs font-bold border-border-color/85 hover:bg-background cursor-pointer select-none"
                >
                  <SlidersHorizontal className="h-4 w-4 shrink-0" />
                  Filter
                </Button>

                {/* Sort dropdown */}
                <Dropdown
                  trigger={
                    <button className="flex items-center gap-1.5 px-3.5 h-10 border border-border-color/80 bg-background/50 hover:bg-background rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer select-none">
                      <span>Sort: {selectedSort}</span>
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  }
                  items={sortItems}
                />
              </div>
            </div>

            {/* Filter tags summary */}
            {(filterStatus !== "All" || filterDifficulty !== "All" || filterSource !== "All" || filterScore !== "All") && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold select-none">
                <span className="text-text-secondary">Active Filters:</span>
                {filterStatus !== "All" && <Badge variant="secondary">Status: {filterStatus}</Badge>}
                {filterDifficulty !== "All" && <Badge variant="secondary">Difficulty: {filterDifficulty}</Badge>}
                {filterSource !== "All" && <Badge variant="secondary">Source: {filterSource}</Badge>}
                {filterScore !== "All" && <Badge variant="secondary">Score: {filterScore}</Badge>}
                <button
                  onClick={clearFilters}
                  className="text-primary hover:underline text-xs font-bold focus:outline-none cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Quizzes list grid */}
            {filteredAndSortedQuizzes.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredAndSortedQuizzes.slice(0, visibleCount).map((quiz) => {
                    const isCompleted = quiz.status === "completed";
                    const isInProgress = quiz.status === "in_progress";
                    
                    return (
                      <Card
                        key={quiz.id}
                        hoverLift
                        className="border border-border-color/80 bg-surface p-5 rounded-xl flex flex-col justify-between min-h-[220px] transition-all duration-200 hover:border-primary/25"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0">
                                {quiz.mode}
                              </Badge>
                              {quiz.recommended && (
                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                              )}
                            </div>
                            <Dropdown
                              trigger={
                                <button className="p-1 hover:bg-background rounded-full border border-transparent hover:border-border-color transition-colors cursor-pointer text-text-secondary">
                                  <MoreVertical className="h-4.5 w-4.5" />
                                </button>
                              }
                              items={getCardActions(quiz)}
                            />
                          </div>

                          <h4 className="font-bold text-text-primary text-sm mt-3 leading-snug line-clamp-1 truncate max-w-[200px]" title={quiz.title}>
                            {quiz.title}
                          </h4>
                          <span className="text-[9px] text-text-secondary font-semibold uppercase tracking-wider block mt-1">
                            Source: {quiz.sourceDocument}
                          </span>
                        </div>

                        <div className="mt-6 pt-3.5 border-t border-border-color/50 space-y-4">
                          <div className="flex justify-between items-center text-xs text-text-secondary font-medium select-none">
                            <span>{quiz.questionCount} Questions</span>
                            <span>~{quiz.estimatedMinutes} mins</span>
                          </div>

                          <div className="flex justify-between items-center pt-1">
                            {isCompleted && quiz.score !== undefined ? (
                              <div className="space-y-0.5">
                                <span className="text-xs font-extrabold text-success block">
                                  {quiz.score}% Score
                                </span>
                                <span className="text-[9px] text-text-secondary block font-semibold">
                                  Completed {quiz.createdAt}
                                </span>
                              </div>
                            ) : isInProgress ? (
                              <div className="space-y-1.5 flex-1">
                                <div className="flex justify-between text-[10px] font-semibold text-text-secondary">
                                  <span>{quiz.progress} / {quiz.questionCount} done</span>
                                  <span>{Math.round((quiz.progress / quiz.questionCount) * 100)}%</span>
                                </div>
                                <ProgressBar value={Math.round((quiz.progress / quiz.questionCount) * 100)} className="h-1" />
                              </div>
                            ) : (
                              <span className="text-[9px] font-bold text-text-secondary/75 uppercase tracking-wider select-none">
                                Not started &bull; {quiz.createdAt}
                              </span>
                            )}

                            {!isInProgress && (
                              <Button
                                variant="secondary"
                                onClick={() => {
                                  if (isCompleted) handleReviewResults(quiz.id);
                                  else handleStartQuiz(quiz.id);
                                }}
                                className="h-8 py-0 px-3.5 text-[10px] font-bold cursor-pointer shrink-0"
                              >
                                {isCompleted ? "Results" : "Start"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* LOAD MORE BUTTON */}
                {visibleCount < filteredAndSortedQuizzes.length && (
                  <div className="flex justify-center pt-4 select-none">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount((prev) => prev + 3)}
                      className="px-6 h-9.5 text-xs font-semibold border-border-color/85 hover:bg-background cursor-pointer"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* NO FILTER RESULTS STATE */
              <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-color rounded-xl bg-surface/50 font-sans min-h-[300px]">
                <AlertTriangle className="h-8 w-8 text-text-secondary mb-4 opacity-75" />
                <h4 className="text-sm font-bold text-text-primary mb-1">
                  No quizzes match your filters
                </h4>
                <p className="text-xs text-text-secondary max-w-sm mb-5 leading-normal">
                  Try removing some active filter checkboxes or searching for another keyword.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="h-8.5 px-4 text-xs font-semibold border-border-color cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCreateQuiz}
                    className="h-8.5 px-4 text-xs font-semibold cursor-pointer"
                  >
                    Create Quiz
                  </Button>
                </div>
              </div>
            )}

          </div>

        </main>
      </div>

      {/* FILTER DIALOG POP-OVER */}
      <Dialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Quizzes"
        description="Filter your study checklist by status, difficulty, source, or scores."
      >
        <div className="space-y-4 py-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary block">
                Attempt Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9.5 w-full px-2 rounded-lg border border-border-color bg-surface text-xs focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary block">
                Difficulty Level
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="h-9.5 w-full px-2 rounded-lg border border-border-color bg-surface text-xs focus:outline-none"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Adaptive">Adaptive</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary block">
                Source Document
              </label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="h-9.5 w-full px-2 rounded-lg border border-border-color bg-surface text-xs focus:outline-none"
              >
                <option value="All">All Documents</option>
                <option value="Operating Systems">Operating Systems.pdf</option>
                <option value="DBMS">DBMS_Lecture_Notes.docx</option>
                <option value="Computer Networks">Computer Networks.pdf</option>
                <option value="Data Structures">Data Structures & Algorithms.docx</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-text-secondary block">
                Test Score Range
              </label>
              <select
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="h-9.5 w-full px-2 rounded-lg border border-border-color bg-surface text-xs focus:outline-none"
              >
                <option value="All">Any Score</option>
                <option value="Below 50%">Below 50%</option>
                <option value="50–70%">50–70%</option>
                <option value="70–90%">70–90%</option>
                <option value="90%+">90%+</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-color/40">
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="h-9 px-4 text-xs font-semibold border-border-color cursor-pointer"
            >
              Clear Filters
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={applyFilters}
              className="h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              Apply
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete this quiz?"
        description="This will remove the quiz from your library. Your learning analytics will not be deleted."
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteOpen(false)}
            className="h-9 px-4 text-xs font-semibold border-border-color cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={confirmDeleteQuiz}
            className="h-9 px-4 text-xs font-semibold cursor-pointer bg-error hover:bg-error/90 text-white border-transparent"
          >
            Delete Quiz
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
