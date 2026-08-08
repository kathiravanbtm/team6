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

// Mock Data
const initialDocuments: DocumentItem[] = [
  {
    id: "doc-1",
    name: "Lecture 3 - Mitochondrial Genetics.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedAt: "2 hours ago",
    status: "ready",
    topicsCount: 4,
    quizzesCount: 1,
  },
  {
    id: "doc-2",
    name: "Krebs Cycle pathways and intermediates.docx",
    type: "docx",
    size: "1.1 MB",
    uploadedAt: "Yesterday",
    status: "ready",
    topicsCount: 3,
    quizzesCount: 1,
  },
  {
    id: "doc-3",
    name: "Action Potential summary notes.md",
    type: "md",
    size: "18 KB",
    uploadedAt: "3 days ago",
    status: "ready",
    topicsCount: 5,
    quizzesCount: 1,
  },
];

const initialQuizzes: QuizItem[] = [
  {
    id: "quiz-1",
    title: "Mitochondrial Genetics Quiz",
    sourceDocument: "Lecture 3 - Mitochondrial Genetics.pdf",
    questionsCount: 3,
    difficulty: "medium",
    progress: 0,
  },
  {
    id: "quiz-2",
    title: "Krebs Cycle Diagnostics",
    sourceDocument: "Krebs Cycle pathways and intermediates.docx",
    questionsCount: 3,
    difficulty: "hard",
    progress: 100,
    bestScore: 80,
  },
];

const mockFlashcards: FlashcardItem[] = [
  {
    id: "fc-1",
    front: "What is maternal inheritance in mitochondrial genetics?",
    back: "Mitochondria are inherited exclusively from the mother because the sperm's mitochondria are generally destroyed after fertilization, and the oocyte contains several hundred thousand copies of mitochondrial DNA.",
    topic: "Genetics",
  },
  {
    id: "fc-2",
    front: "What is heteroplasmy?",
    back: "Heteroplasmy refers to the presence of more than one type of organellar genome (mitochondrial DNA) within a single cell or individual. It is a critical factor in the severity of mitochondrial diseases.",
    topic: "Genetics",
  },
  {
    id: "fc-3",
    front: "What is the function of Cytochrome c in cellular pathways?",
    back: "Cytochrome c is a small protein localized in the inner mitochondrial membrane. It transfers electrons between Complexes III and IV in the electron transport chain, and can also trigger apoptosis if released into the cytosol.",
    topic: "Biochemistry",
  },
];

const mockQuizQuestions: QuestionItem[] = [
  {
    id: "q-1",
    question: "Why does mitochondrial DNA exhibit a significantly higher mutation rate than nuclear DNA?",
    options: [
      "Mitochondrial DNA contains more introns that attract mutagens",
      "Lack of protective histone proteins and proximity to reactive oxygen species (ROS)",
      "Mitochondrial DNA polymerase has no proofreading capabilities",
      "Mitochondria actively absorb mutagens from the cytoplasm",
    ],
    correctIndex: 1,
    explanation: "Correct! Mitochondrial DNA (mtDNA) is not bound by protective histones and is physically located in the inner membrane, directly adjacent to the respiratory chain where high levels of damaging reactive oxygen species (ROS) are generated during oxidative phosphorylation.",
  },
  {
    id: "q-2",
    question: "A patient displays muscle weakness, lactic acidosis, and red ragged fibers on muscle biopsy. Which inheritance pattern is most likely?",
    options: [
      "Autosomal Dominant",
      "Autosomal Recessive",
      "X-linked Recessive",
      "Mitochondrial (Maternal)",
    ],
    correctIndex: 3,
    explanation: "Correct! The combination of muscle weakness, lactic acidosis, and ragged red fibers is classic for mitochondrial encephalomyopathies (like MELAS or MERRF), which are caused by mutations in mitochondrial tRNA genes and follow maternal inheritance.",
  },
  {
    id: "q-3",
    question: "Which of the following complexes in the electron transport chain does NOT pump protons into the intermembrane space?",
    options: [
      "Complex I (NADH dehydrogenase)",
      "Complex II (Succinate dehydrogenase)",
      "Complex III (Cytochrome c reductase)",
      "Complex IV (Cytochrome c oxidase)",
    ],
    correctIndex: 1,
    explanation: "Correct! Complex II (Succinate dehydrogenase) transfers electrons from FADH2 to coenzyme Q, but it does not pump protons across the inner mitochondrial membrane. Complexes I, III, and IV pump protons, establishing the electrochemical gradient.",
  },
];

const analyticsData = [
  { date: "Mon", studyTime: 45, accuracy: 70 },
  { date: "Tue", studyTime: 60, accuracy: 75 },
  { date: "Wed", studyTime: 30, accuracy: 80 },
  { date: "Thu", studyTime: 90, accuracy: 82 },
  { date: "Fri", studyTime: 50, accuracy: 85 },
  { date: "Sat", studyTime: 120, accuracy: 82 },
  { date: "Sun", studyTime: 75, accuracy: 88 },
];

interface DashboardShellProps {
  initialTab?: string;
  title?: string;
}

export function DashboardShell({ initialTab = "materials", title = "AI Learning Lab" }: DashboardShellProps) {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Sync tab with props changes
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Dynamic States
  const [documents, setDocuments] = React.useState<DocumentItem[]>(initialDocuments);
  const [quizzes, setQuizzes] = React.useState<QuizItem[]>(initialQuizzes);

  // Uploading Flow
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadSteps, setUploadSteps] = React.useState<ProcessingStep[]>([]);

  // Flashcards state
  const [currentFcIndex, setCurrentFcIndex] = React.useState(0);

  // Practice session state
  const [practiceActive, setPracticeActive] = React.useState(false);
  const [currentQIndex, setCurrentQIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = React.useState(0);

  const tabs: TabOption[] = [
    { id: "materials", label: "Study Materials", icon: <FileText className="h-4 w-4" /> },
    { id: "quizzes", label: "AI Quizzes", icon: <HelpCircle className="h-4 w-4" /> },
    { id: "flashcards", label: "Flashcards", icon: <Layers className="h-4 w-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
  ];

  // Document Upload Mock Flow
  const handleUpload = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadSteps([
      { id: "step-1", label: `Uploading "${file.name}"`, status: "running" },
      { id: "step-2", label: "Extracting document concepts", status: "idle" },
      { id: "step-3", label: "Generating practice questions & answers", status: "idle" },
    ]);

    // Step 1: Uploading complete
    setTimeout(() => {
      setUploadSteps((prev) =>
        prev.map((s, idx) =>
          idx === 0
            ? { ...s, status: "completed" }
            : idx === 1
            ? { ...s, status: "running" }
            : s
        )
      );

      // Step 2: Extracting concepts complete
      setTimeout(() => {
        setUploadSteps((prev) =>
          prev.map((s, idx) =>
            idx === 1
              ? { ...s, status: "completed" }
              : idx === 2
              ? { ...s, status: "running" }
              : s
          )
        );

        // Step 3: Generating quiz complete
        setTimeout(() => {
          setIsUploading(false);

          const newDocId = `doc-${Date.now()}`;
          const newDoc: DocumentItem = {
            id: newDocId,
            name: file.name,
            type: (file.name.split(".").pop() as any) || "pdf",
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadedAt: "Just now",
            status: "ready",
            topicsCount: 4,
            quizzesCount: 1,
          };

          const newQuiz: QuizItem = {
            id: `quiz-${Date.now()}`,
            title: `${file.name.replace(/\.[^/.]+$/, "")} Quiz`,
            sourceDocument: file.name,
            questionsCount: 3,
            difficulty: "medium",
            progress: 0,
          };

          setDocuments((prev) => [newDoc, ...prev]);
          setQuizzes((prev) => [newQuiz, ...prev]);

          toast(`Successfully processed "${file.name}"`, {
            type: "success",
            description: "Your AI Quiz and Flashcards are ready!",
          });
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const handleDeleteDoc = (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    if (!docToDelete) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast(`Deleted ${docToDelete.name}`, { type: "info" });
  };

  // Start Quiz Practice
  const handleStartQuiz = (id: string) => {
    setPracticeActive(true);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setCorrectAnswersCount(0);
    setActiveTab("quizzes");
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleQuestionSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    if (selectedOption === mockQuizQuestions[currentQIndex].correctIndex) {
      setCorrectAnswersCount((prev) => prev + 1);
      toast("Correct!", { type: "success" });
    } else {
      toast("Incorrect", { type: "error" });
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < mockQuizQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setPracticeActive(false);
      const score = Math.round((correctAnswersCount / mockQuizQuestions.length) * 100);

      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === "quiz-1"
            ? { ...q, progress: 100, bestScore: Math.max(q.bestScore ?? 0, score) }
            : q
        )
      );

      toast("Practice Session Completed!", {
        type: "success",
        description: `You scored ${score}% (${correctAnswersCount}/${mockQuizQuestions.length} correct)`,
      });
    }
  };

  const handleFlashcardScore = (id: string, gotIt: boolean) => {
    if (gotIt) {
      toast("Great job! Flashcard saved to learned ledger.", { type: "success" });
    } else {
      toast("No worries. Flashcard scheduled for short-term review.", { type: "info" });
    }
    setTimeout(() => {
      setCurrentFcIndex((prev) => (prev + 1) % mockFlashcards.length);
    }, 1000);
  };

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
              value="82%"
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
                        onGenerateQuiz={() => handleStartQuiz("quiz-1")}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {quizzes.map((quiz) => (
                      <QuizCard
                        key={quiz.id}
                        quiz={quiz}
                        onStart={handleStartQuiz}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-text-primary text-base">
                        Mitochondrial Genetics Quiz
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Question {currentQIndex + 1} of {mockQuizQuestions.length}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPracticeActive(false)}>
                      Exit Quiz
                    </Button>
                  </div>

                  <QuestionCard
                    question={mockQuizQuestions[currentQIndex]}
                    selectedOption={selectedOption}
                    onSelectOption={handleSelectOption}
                    isSubmitted={isSubmitted}
                    onSubmit={handleQuestionSubmit}
                    onNext={handleNextQuestion}
                    isLastQuestion={currentQIndex === mockQuizQuestions.length - 1}
                  />
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

              <Flashcard
                card={mockFlashcards[currentFcIndex]}
                onScore={handleFlashcardScore}
              />

              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-text-secondary">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentFcIndex((prev) => (prev - 1 + mockFlashcards.length) % mockFlashcards.length)
                  }
                  className="h-8 py-0 px-3 cursor-pointer"
                >
                  Previous
                </Button>
                <span>
                  {currentFcIndex + 1} of {mockFlashcards.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentFcIndex((prev) => (prev + 1) % mockFlashcards.length)}
                  className="h-8 py-0 px-3 cursor-pointer"
                >
                  Next Card
                </Button>
              </div>
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
