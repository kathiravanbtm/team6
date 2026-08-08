"use client";

import * as React from "react";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { StatCard } from "@/components/learnforge/stat-card";
import { DocumentCard, DocumentItem } from "@/components/learnforge/document-card";
import { QuizCard, QuizItem } from "@/components/learnforge/quiz-card";
import { Flashcard, FlashcardItem } from "@/components/learnforge/flashcard";
import { QuestionCard, QuestionItem } from "@/components/learnforge/question-card";
import { UploadDropzone } from "@/components/learnforge/upload-dropzone";
import { ProcessingStatus, ProcessingStep } from "@/components/learnforge/processing-status";
import { Tabs, TabOption } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/state-indicators";
import { ToastContainer, toast } from "@/components/ui/toast";
import {
  FileText,
  HelpCircle,
  Layers,
  BarChart2,
  TrendingUp,
  BrainCircuit,
  Calendar,
  Clock,
  Sparkles,
  Zap,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";

// Keep visual fallback analytics data
const analyticsData = [
  { date: "Mon", studyTime: 45, accuracy: 70 },
  { date: "Tue", studyTime: 60, accuracy: 75 },
  { date: "Wed", studyTime: 30, accuracy: 80 },
  { date: "Thu", studyTime: 90, accuracy: 82 },
  { date: "Fri", studyTime: 50, accuracy: 85 },
  { date: "Sat", studyTime: 120, accuracy: 82 },
  { date: "Sun", studyTime: 75, accuracy: 88 },
];

const API_BASE = "http://localhost:5000/api";

interface DashboardShellProps {
  initialTab?: string;
  title?: string;
}

export function DashboardShell({ initialTab = "quizzes", title = "AI Learning Lab" }: DashboardShellProps) {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Sync tab with props changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Dynamic States from Backend
  const [documents, setDocuments] = React.useState<DocumentItem[]>([]);
  const [quizzes, setQuizzes] = React.useState<QuizItem[]>([]);
  const [flashcards, setFlashcards] = React.useState<FlashcardItem[]>([]);
  const [selectedDocId, setSelectedDocId] = React.useState<string | null>(null);

  // Uploading Flow
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSteps, setUploadSteps] = React.useState<ProcessingStep[]>([]);

  // Flashcards Index
  const [currentFcIndex, setCurrentFcIndex] = React.useState(0);

  // Practice session state
  const [practiceActive, setPracticeActive] = React.useState(false);
  const [activeQuizQuestions, setActiveQuizQuestions] = React.useState<QuestionItem[]>([]);
  const [activeQuizId, setActiveQuizId] = React.useState<string | null>(null);
  const [activeQuizTitle, setActiveQuizTitle] = React.useState<string>("Practice Quiz");
  const [currentQIndex, setCurrentQIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<string[]>([]);

  const tabs: TabOption[] = [
    { id: "quizzes", label: "AI Quizzes", icon: <HelpCircle className="h-4 w-4" /> },
  ];

  // Fetch Documents List
  const fetchDocuments = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/documents`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
    } catch (err: any) {
      console.error("Error fetching documents:", err.message);
    }
  }, []);

  // Fetch Quizzes List
  const fetchQuizzes = React.useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/quiz`);
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      const data = await res.json();
      setQuizzes(data);
    } catch (err: any) {
      console.error("Error fetching quizzes:", err.message);
    }
  }, []);

  React.useEffect(() => {
    fetchDocuments();
    fetchQuizzes();
  }, [fetchDocuments, fetchQuizzes]);

  // If flashcard tab active and no cards are loaded, load cards for the first document
  React.useEffect(() => {
    if (activeTab === "flashcards" && flashcards.length === 0 && documents.length > 0) {
      handleStudyFlashcards(documents[0].id);
    }
  }, [activeTab, flashcards.length, documents]);

  // Document Upload Flow calling Backend API
  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadSteps([
      { id: "step-1", label: `Uploading "${file.name}"`, status: "running" },
      { id: "step-2", label: "Extracting document concepts", status: "idle" },
      { id: "step-3", label: "Generating practice questions & answers", status: "idle" },
    ]);

    try {
      // Step 1: Upload and Parse document on server
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${API_BASE}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || "Failed to upload document");
      }

      const uploadData = await uploadRes.json();
      const docId = uploadData.document_id;

      setUploadSteps((prev) =>
        prev.map((s, idx) =>
          idx === 0
            ? { ...s, status: "completed" }
            : idx === 1
            ? { ...s, status: "running" }
            : s
        )
      );

      // Step 2: Extracting concepts / Trigger quiz generation
      const quizRes = await fetch(`${API_BASE}/quiz/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: docId,
          num_questions: 5,
          difficulty: "medium",
        }),
      });

      if (!quizRes.ok) {
        const errorData = await quizRes.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      setUploadSteps((prev) =>
        prev.map((s, idx) =>
          idx === 1
            ? { ...s, status: "completed" }
            : idx === 2
            ? { ...s, status: "running" }
            : s
        )
      );

      // Step 3: Trigger Flashcards generation in background
      await fetch(`${API_BASE}/flashcards/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: docId,
          count: 5,
        }),
      });

      setUploadSteps((prev) =>
        prev.map((s, idx) =>
          idx === 2
            ? { ...s, status: "completed" }
            : s
        )
      );

      // Wait briefly for smooth transition
      await new Promise((r) => setTimeout(r, 600));

      setIsUploading(false);
      fetchDocuments();
      fetchQuizzes();

      toast(`Successfully processed "${file.name}"`, {
        type: "success",
        description: "Your AI Quiz and Flashcards are ready!",
      });

    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      toast(err.message || "Failed to upload and process document", {
        type: "error",
      });
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete document");

      setDocuments((prev) => prev.filter((d) => d.id !== id));
      fetchQuizzes();
      toast("Deleted document successfully", { type: "info" });
    } catch (err: any) {
      console.error(err);
      toast("Error deleting file: " + err.message, { type: "error" });
    }
  };

  // Generate quiz explicitly for a document
  const handleGenerateQuiz = async (docId: string) => {
    try {
      toast("Generating AI Quiz...", { type: "info" });
      const res = await fetch(`${API_BASE}/quiz/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: docId,
          num_questions: 5,
          difficulty: "medium",
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate quiz");
      }

      const data = await res.json();
      toast("AI Quiz generated! Starting practice...", { type: "success" });
      fetchQuizzes();
      handleStartQuiz(data.quiz_id);
    } catch (err: any) {
      console.error(err);
      toast("Error generating quiz: " + err.message, { type: "error" });
    }
  };

  // Start Quiz Practice calling Backend
  const handleStartQuiz = async (quizId: string) => {
    try {
      const res = await fetch(`${API_BASE}/quiz/${quizId}`);
      if (!res.ok) throw new Error("Failed to fetch quiz details");
      const data = await res.json();

      const qList: QuestionItem[] = (data.questions || []).map((q: any) => ({
        id: q.id,
        question: q.question_text,
        options: q.options,
        correctIndex: q.options.indexOf(q.correct_answer),
        explanation: q.explanation || "No explanation provided.",
      }));

      setActiveQuestions(qList);
      setActiveQuizId(quizId);
      setActiveQuizTitle(data.title || "Practice Quiz");
      
      setPracticeActive(true);
      setCurrentQIndex(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setCorrectAnswersCount(0);
      setSelectedAnswers([]);
      setActiveTab("quizzes");
    } catch (err: any) {
      console.error(err);
      toast("Error loading quiz questions: " + err.message, { type: "error" });
    }
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleQuestionSubmit = () => {
    if (selectedOption === null || activeQuestions.length === 0) return;
    setIsSubmitted(true);

    const selectedAnswerText = activeQuestions[currentQIndex].options[selectedOption];
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[currentQIndex] = selectedAnswerText;
      return next;
    });

    if (selectedOption === activeQuestions[currentQIndex].correctIndex) {
      setCorrectAnswersCount((prev) => prev + 1);
      toast("Correct!", { type: "success" });
    } else {
      toast("Incorrect", { type: "error" });
    }
  };

  const handleNextQuestion = async () => {
    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setPracticeActive(false);
      const score = Math.round((correctAnswersCount / activeQuestions.length) * 100);

      // Submit attempt details to backend
      if (activeQuizId) {
        try {
          const finalAnswers = activeQuestions.map((q, idx) => ({
            question_id: q.id,
            selected: idx === currentQIndex 
              ? activeQuestions[currentQIndex].options[selectedOption!]
              : selectedAnswers[idx],
          }));

          await fetch(`${API_BASE}/quiz/${activeQuizId}/submit`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ answers: finalAnswers }),
          });

          fetchQuizzes(); // Reload scores
        } catch (err) {
          console.error("Failed to record quiz attempt:", err);
        }
      }

      toast("Practice Session Completed!", {
        type: "success",
        description: `You scored ${score}% (${correctAnswersCount}/${activeQuestions.length} correct)`,
      });
    }
  };

  // Flashcards Study Flow calling Backend
  const handleStudyFlashcards = async (docId: string) => {
    try {
      setSelectedDocId(docId);
      const res = await fetch(`${API_BASE}/flashcards/${docId}`);
      if (!res.ok) throw new Error("Failed to fetch flashcards");
      const data = await res.json();

      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        setCurrentFcIndex(0);
        setActiveTab("flashcards");
      } else {
        // Trigger auto generation if empty
        toast("No flashcards found for this document. Generating with AI...", { type: "info" });
        const genRes = await fetch(`${API_BASE}/flashcards/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ document_id: docId, count: 5 }),
        });

        if (!genRes.ok) throw new Error("Failed to generate flashcards");
        const genData = await genRes.json();
        
        setFlashcards(genData.flashcards);
        setCurrentFcIndex(0);
        setActiveTab("flashcards");
        toast("AI Flashcards ready!", { type: "success" });
      }
    } catch (err: any) {
      console.error(err);
      toast("Error loading flashcards: " + err.message, { type: "error" });
    }
  };

  const handleFlashcardScore = (id: string, gotIt: boolean) => {
    if (gotIt) {
      toast("Great job! Flashcard saved to learned ledger.", { type: "success" });
    } else {
      toast("No worries. Flashcard scheduled for short-term review.", { type: "info" });
    }
    setTimeout(() => {
      if (flashcards.length > 0) {
        setCurrentFcIndex((prev) => (prev + 1) % flashcards.length);
      }
    }, 1000);
  };

  // Calculate dynamic stats
  const completedQuizzes = quizzes.filter(q => q.bestScore !== null && q.bestScore !== undefined);
  const avgScore = completedQuizzes.length > 0 
    ? Math.round(completedQuizzes.reduce((sum, q) => sum + (q.bestScore || 0), 0) / completedQuizzes.length)
    : 82; // visual default fallback

  const [activeQuestions, setActiveQuestions] = React.useState<QuestionItem[]>([]);

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex flex-col flex-1 md:pl-[240px]">
        <Topbar title={title} />

        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8">
          {/* Headline Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Daily Active Streak"
              value="7 Days"
              icon={<Calendar className="h-5 w-5" />}
              description="Keep up the practice!"
              progress={100}
            />
            <StatCard
              title="Average Score"
              value={`${avgScore}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              trend={{ value: "+4.5%", type: "positive" }}
            />
            <StatCard
              title="Study Materials"
              value={documents.length}
              icon={<FileText className="h-5 w-5" />}
              description="Active files uploaded"
            />
            <StatCard
              title="Knowledge Mastery"
              value="68%"
              icon={<Zap className="h-5 w-5" />}
              progress={68}
              description="Topic coverage indicator"
            />
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-border-color">
            <Tabs options={tabs} activeId={activeTab} onChange={(id) => {
              setActiveTab(id);
              setPracticeActive(false);
            }} />
          </div>

          {/* TAB CONTENTS */}

          {/* TAB 1: STUDY MATERIALS */}
          {activeTab === "materials" && (
            <div className="space-y-6">
              {isUploading ? (
                <div className="py-8">
                  <ProcessingStatus steps={uploadSteps} />
                </div>
              ) : (
                // Use local upload dropzone
                <UploadDropzone onUpload={handleUpload} />
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-text-primary text-base">
                    Uploaded Documents
                  </h3>
                  <span className="text-xs font-semibold text-text-secondary">
                    {documents.length} Items
                  </span>
                </div>

                {documents.length === 0 ? (
                  <EmptyState
                    title="No materials uploaded"
                    description="Upload notes, text summaries or papers to start generating custom quizzes."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {documents.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        onDelete={handleDeleteDoc}
                        onGenerateQuiz={handleGenerateQuiz}
                        onStudyFlashcards={handleStudyFlashcards}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI QUIZZES */}
          {activeTab === "quizzes" && (
            <div className="space-y-6">
              {!practiceActive ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-text-primary text-base">
                      Interactive Practice Quizzes
                    </h3>
                    <span className="text-xs font-semibold text-text-secondary">
                      {quizzes.length} Available
                    </span>
                  </div>

                  {quizzes.length === 0 ? (
                    <EmptyState
                      title="No quizzes generated yet"
                      description="Go to Study Materials and click Generate Quiz to generate your first AI practice quiz."
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {quizzes.map((quiz) => (
                        <QuizCard
                          key={quiz.id}
                          quiz={quiz}
                          onStart={handleStartQuiz}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-text-primary text-base">
                        {activeQuizTitle}
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Question {currentQIndex + 1} of {activeQuestions.length}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPracticeActive(false)}>
                      Exit Quiz
                    </Button>
                  </div>

                  {activeQuestions.length > 0 && (
                    <QuestionCard
                      question={activeQuestions[currentQIndex]}
                      selectedOption={selectedOption}
                      onSelectOption={handleSelectOption}
                      isSubmitted={isSubmitted}
                      onSubmit={handleQuestionSubmit}
                      onNext={handleNextQuestion}
                      isLastQuestion={currentQIndex === activeQuestions.length - 1}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FLASHCARDS */}
          {activeTab === "flashcards" && (
            <div className="space-y-6 py-6">
              <div className="text-center space-y-1 mb-4">
                <h3 className="font-bold text-text-primary text-base">
                  Active Recall Cards
                </h3>
                <p className="text-xs text-text-secondary">
                  Review terms and test your retention. Flip cards to rate understanding.
                </p>
              </div>

              {flashcards.length === 0 ? (
                <EmptyState
                  title="No flashcards loaded"
                  description="Upload study materials to automatically generate flashcards, or select 'Study Flashcards' from your materials list."
                />
              ) : (
                <>
                  <Flashcard
                    card={flashcards[currentFcIndex]}
                    onScore={handleFlashcardScore}
                  />

                  <div className="flex items-center justify-center gap-4 text-xs font-semibold text-text-secondary">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentFcIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
                      }
                      className="h-8 py-0 px-3 cursor-pointer"
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
                      className="h-8 py-0 px-3 cursor-pointer"
                    >
                      Next Card
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border-color p-5 bg-surface font-sans">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                      <Clock className="h-4.5 w-4.5 text-primary" />
                      Practice Time (Minutes/Day)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Daily focus indicators for the current week.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 h-64 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData}>
                        <defs>
                          <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                        <ChartTooltip />
                        <Area
                          type="monotone"
                          dataKey="studyTime"
                          stroke="#4F46E5"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorStudy)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border border-border-color p-5 bg-surface font-sans">
                  <CardHeader className="p-0 pb-3">
                    <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                      <TrendingUp className="h-4.5 w-4.5 text-success" />
                      Quiz Accuracy Rate (%)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Trend lines showing accuracy increments on practices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 h-64 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData}>
                        <defs>
                          <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} />
                        <YAxis stroke="#64748B" fontSize={10} tickLine={false} domain={[50, 100]} />
                        <ChartTooltip />
                        <Area
                          type="monotone"
                          dataKey="accuracy"
                          stroke="#16A34A"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorAccuracy)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="border border-border-color p-6 bg-surface">
                <h4 className="font-bold text-text-primary text-sm mb-4">
                  Weak Concept Analytics Ledger
                </h4>
                <p className="text-xs text-text-secondary mb-6">
                  AI analyzes incorrect options you pick to pinpoint target areas.
                </p>

                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-text-primary">
                        Mitochondrial DNA Mutations (Genetics)
                      </span>
                      <span className="text-error font-bold">42% Accuracy</span>
                    </div>
                    <div className="h-2 w-full bg-border-color/50 rounded-full overflow-hidden">
                      <div className="h-full bg-error" style={{ width: "42%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-text-primary">
                        Krebs Cycle Intermediates (Biochemistry)
                      </span>
                      <span className="text-warning font-bold">58% Accuracy</span>
                    </div>
                    <div className="h-2 w-full bg-border-color/50 rounded-full overflow-hidden">
                      <div className="h-full bg-warning" style={{ width: "58%" }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
