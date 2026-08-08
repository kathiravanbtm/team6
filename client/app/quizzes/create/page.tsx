"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuizStore, QuizConfig } from "@/lib/services/quiz";

const API_BASE = "http://localhost:5000/api";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/learnforge/badges";
import { toast, ToastContainer } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  BrainCircuit,
  Sliders,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

// Mock materials data for selection
const mockMaterials = [
  { id: "doc-1", name: "Operating Systems.pdf", type: "pdf", pages: 124, topics: 6, concepts: 32 },
  { id: "doc-2", name: "Lecture 3 - Mitochondrial Genetics.pdf", type: "pdf", pages: 24, topics: 4, concepts: 15 },
  { id: "doc-3", name: "Krebs Cycle pathways.docx", type: "docx", pages: 12, topics: 3, concepts: 10 },
  { id: "doc-4", name: "Action Potential summary notes.md", type: "md", pages: 2, topics: 5, concepts: 8 },
];

// Mock topics mapping based on material
const mockMaterialTopics: Record<string, { name: string; conceptCount: number; mastery: number }[]> = {
  "doc-1": [
    { name: "Process Management", conceptCount: 8, mastery: 88 },
    { name: "CPU Scheduling", conceptCount: 6, mastery: 61 },
    { name: "Deadlocks", conceptCount: 5, mastery: 42 },
    { name: "Memory Management", conceptCount: 7, mastery: 68 },
    { name: "File Systems", conceptCount: 4, mastery: 75 },
    { name: "I/O Systems", conceptCount: 2, mastery: 80 },
  ],
  "doc-2": [
    { name: "Maternal Inheritance", conceptCount: 4, mastery: 90 },
    { name: "Mitochondrial Mutations", conceptCount: 5, mastery: 45 },
    { name: "Heteroplasmy Mechanisms", conceptCount: 3, mastery: 55 },
    { name: "Electron Transport chains", conceptCount: 3, mastery: 82 },
  ],
  "doc-3": [
    { name: "Krebs Cycle Intermediates", conceptCount: 5, mastery: 58 },
    { name: "NADH & FADH2 Synthesis", conceptCount: 3, mastery: 85 },
    { name: "Regulation mechanisms", conceptCount: 2, mastery: 72 },
  ],
  "doc-4": [
    { name: "Resting Membrane potential", conceptCount: 2, mastery: 88 },
    { name: "Depolarization phases", conceptCount: 3, mastery: 69 },
    { name: "Refractory periods", conceptCount: 3, mastery: 78 },
  ],
};

const mockQuestionTypes = [
  { id: "mcq", label: "Multiple Choice", desc: "Quickly test recognition and understanding." },
  { id: "tf", label: "True / False", desc: "Evaluate straightforward facts." },
  { id: "short", label: "Short Answer", desc: "Check recall and detailed terminology." },
  { id: "scenario", label: "Scenario Based", desc: "Apply concepts to complex diagnostics." },
];

const mockGoals = [
  "Test my understanding",
  "Prepare for an exam",
  "Quick revision",
  "Practice weak areas",
  "Deep understanding",
];

export default function CreateQuizPage() {
  const router = useRouter();
  const setConfig = useQuizStore((state: any) => state.setConfig);

  const [materials, setMaterials] = React.useState<any[]>(mockMaterials);

  // Guided Form state
  const [selectedMaterialId, setSelectedMaterialId] = React.useState("doc-1");
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [questionCount, setQuestionCount] = React.useState<number>(10);
  const [isCustomCount, setIsCustomCount] = React.useState(false);
  const [customCountValue, setCustomCountValue] = React.useState("15");
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>(["mcq"]);
  const [difficulty, setDifficulty] = React.useState<"easy" | "medium" | "hard" | "adaptive">("medium");
  const [goal, setGoal] = React.useState("Test my understanding");

  // Fetch real study materials from backend
  React.useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`${API_BASE}/documents`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const dbDocs = data.map((d: any) => ({
              id: d.id,
              name: d.name || d.title,
              type: d.type || "pdf",
              pages: d.pageCount || 10,
              topics: d.topicsCount || 3,
              concepts: d.topicsCount ? d.topicsCount * 4 : 12,
            }));
            
            // Merge mock materials with DB ones, prioritizing DB ones
            setMaterials(dbDocs);
            
            // Auto select first material or query param materialId
            const urlParams = new URLSearchParams(window.location.search);
            const urlMatId = urlParams.get("materialId");
            if (urlMatId && dbDocs.some((d: any) => d.id === urlMatId)) {
              setSelectedMaterialId(urlMatId);
            } else {
              setSelectedMaterialId(dbDocs[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load documents", err);
      }
    };
    fetchDocs();
  }, []);

  // Compute active topics list dynamically
  const activeTopics = React.useMemo(() => {
    const mat = materials.find((m) => m.id === selectedMaterialId);
    const name = mat?.name || mat?.title || "Study Material";
    if (mockMaterialTopics[selectedMaterialId]) {
      return mockMaterialTopics[selectedMaterialId];
    }
    // Generic fallback topics for custom uploaded materials
    return [
      { name: `${name.replace(/\.[^/.]+$/, "")} - Foundations`, conceptCount: 4, mastery: 70 },
      { name: `${name.replace(/\.[^/.]+$/, "")} - Key Themes`, conceptCount: 6, mastery: 65 },
      { name: `${name.replace(/\.[^/.]+$/, "")} - Advanced Topics`, conceptCount: 3, mastery: 60 },
    ];
  }, [selectedMaterialId, materials]);

  // Sync default topics on material changes
  React.useEffect(() => {
    setSelectedTopics(activeTopics.map((t) => t.name));
  }, [activeTopics]);

  // Actions
  const handleToggleTopic = (topicName: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  const handleSelectAllTopics = () => {
    setSelectedTopics(activeTopics.map((t) => t.name));
  };

  const handleFocusWeakTopics = () => {
    const weak = activeTopics.filter((t) => t.mastery < 70).map((t) => t.name);
    setSelectedTopics(weak);
    if (weak.length === 0) {
      toast("No weak topics found!", {
        type: "info",
        description: "All topics show mastery scores above 70%.",
      });
    } else {
      toast("Focused on weak topics", {
        type: "success",
        description: `Selected ${weak.length} topics where accuracy is below 70%.`,
      });
    }
  };

  const handleToggleType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((t) => t !== typeId)
        : [...prev, typeId]
    );
  };

  const handleGenerate = () => {
    if (!selectedMaterialId) return;
    if (selectedTopics.length === 0) {
      toast("Select at least one topic", { type: "error" });
      return;
    }
    if (selectedTypes.length === 0) {
      toast("Select at least one question type", { type: "error" });
      return;
    }

    const count = isCustomCount ? parseInt(customCountValue, 10) || 10 : questionCount;
    const material = materials.find((m) => m.id === selectedMaterialId);

    const config: QuizConfig = {
      materialId: selectedMaterialId,
      materialName: material?.name || "Operating Systems.pdf",
      selectedTopics,
      questionCount: count,
      questionTypes: selectedTypes,
      difficulty,
      learningGoal: goal,
      mode: goal === "Prepare for an exam" ? "exam" : "practice",
    };

    setConfig(config);
    router.push("/quizzes/generating");
  };

  const material = materials.find((m) => m.id === selectedMaterialId);
  const activeCount = isCustomCount ? parseInt(customCountValue, 10) || 10 : questionCount;
  const estimatedTime = Math.round(activeCount * 0.75); // 45 seconds per question

  const isValid = selectedMaterialId && selectedTopics.length > 0 && selectedTypes.length > 0;

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        <Topbar title="Create a Quiz" subtitle="Turn your study material into focused practice." />

        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          {/* LEFT: GUIDED BUILDER STEPS */}
          <div className="lg:col-span-8 space-y-10 pb-20">
            
            {/* STEP 1 — MATERIAL */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs select-none">
                  01
                </span>
                <h3 className="font-bold text-text-primary text-base">
                  Select Study Material
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {materials.map((item) => {
                  const isSelected = selectedMaterialId === item.id;
                  return (
                    <Card
                      key={item.id}
                      onClick={() => setSelectedMaterialId(item.id)}
                      className={`cursor-pointer transition-all duration-200 border p-4.5 rounded-xl ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/25"
                          : "border-border-color hover:bg-background/60 bg-surface"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <FileText className={`h-5 w-5 ${isSelected ? "text-primary" : "text-text-secondary"}`} />
                        {isSelected && <Check className="h-4.5 w-4.5 text-primary" />}
                      </div>
                      <h4 className="font-bold text-text-primary text-sm mt-3 leading-snug line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-text-secondary mt-1 font-semibold uppercase tracking-wider">
                        {item.pages} pages &bull; {item.topics} topics
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* STEP 2 — TOPICS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs select-none">
                    02
                  </span>
                  <h3 className="font-bold text-text-primary text-base">
                    Select Topics to Focus On
                  </h3>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAllTopics} className="h-8 text-[10px] font-semibold border-border-color/85 hover:bg-background cursor-pointer">
                    Select all
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleFocusWeakTopics} className="h-8 text-[10px] font-semibold cursor-pointer">
                    Focus on weak topics
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeTopics.map((topic) => {
                  const isSelected = selectedTopics.includes(topic.name);
                  const isWeak = topic.mastery < 70;
                  return (
                    <Card
                      key={topic.name}
                      onClick={() => handleToggleTopic(topic.name)}
                      className={`cursor-pointer transition-all duration-150 border p-3.5 rounded-lg flex items-center justify-between ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border-color hover:bg-background/60 bg-surface"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-text-primary text-xs leading-snug">
                          {topic.name}
                        </h5>
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-text-secondary">
                          <span>{topic.conceptCount} concepts</span>
                          <span className="h-1 w-1 rounded-full bg-border-color" />
                          <span className={isWeak ? "text-error" : "text-success"}>
                            Mastery: {topic.mastery}%
                          </span>
                        </div>
                      </div>
                      <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center ${
                        isSelected ? "border-primary bg-primary text-white" : "border-border-color"
                      }`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* STEP 3 — QUESTION COUNT */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs select-none">
                  03
                </span>
                <h3 className="font-bold text-text-primary text-base">
                  Number of Questions
                </h3>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {[5, 10, 20, 30].map((num) => {
                  const isSelected = !isCustomCount && questionCount === num;
                  return (
                    <button
                      key={num}
                      onClick={() => {
                        setIsCustomCount(false);
                        setQuestionCount(num);
                      }}
                      className={`h-10 px-6 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border-color bg-surface hover:bg-background text-text-secondary"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}

                <button
                  onClick={() => setIsCustomCount(true)}
                  className={`h-10 px-6 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    isCustomCount
                      ? "border-primary bg-primary text-white"
                      : "border-border-color bg-surface hover:bg-background text-text-secondary"
                  }`}
                >
                  Custom
                </button>

                <AnimatePresence>
                  {isCustomCount && (
                    <motion.input
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 75 }}
                      exit={{ opacity: 0, width: 0 }}
                      type="number"
                      min={1}
                      max={50}
                      value={customCountValue}
                      onChange={(e) => setCustomCountValue(e.target.value)}
                      className="h-10 px-3 border border-border-color rounded-lg bg-surface text-center text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* STEP 4 — QUESTION TYPES */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs select-none">
                  04
                </span>
                <h3 className="font-bold text-text-primary text-base">
                  Question Types
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockQuestionTypes.map((type) => {
                  const isSelected = selectedTypes.includes(type.id);
                  return (
                    <Card
                      key={type.id}
                      onClick={() => handleToggleType(type.id)}
                      className={`cursor-pointer border p-4.5 rounded-xl transition-all duration-150 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border-color hover:bg-background/60 bg-surface"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-text-primary text-sm leading-snug">
                          {type.label}
                        </h4>
                        <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center ${
                          isSelected ? "border-primary bg-primary text-white" : "border-border-color"
                        }`}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                        {type.desc}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* STEP 5 — DIFFICULTY */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs select-none">
                  05
                </span>
                <h3 className="font-bold text-text-primary text-base">
                  Select Difficulty
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(["easy", "medium", "hard", "adaptive"] as const).map((diff) => {
                  const isSelected = difficulty === diff;
                  const isAdaptive = diff === "adaptive";
                  return (
                    <Card
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`cursor-pointer border p-4 rounded-xl text-center transition-all duration-150 capitalize relative ${
                        isSelected
                          ? "border-primary bg-primary/5 font-bold"
                          : "border-border-color hover:bg-background/60 bg-surface text-text-secondary"
                      }`}
                    >
                      {isAdaptive && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                          <Sparkles className="h-2 w-2" /> AI Auto
                        </span>
                      )}
                      <h4 className="text-sm font-bold mt-1.5">{diff}</h4>
                      <p className="text-[10px] text-text-secondary mt-1 leading-snug">
                        {diff === "adaptive" ? "Adjusts to performance" : `${diff} questions`}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* STEP 6 — LEARNING GOAL */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs select-none">
                  06
                </span>
                <h3 className="font-bold text-text-primary text-base">
                  Select Learning Goal
                </h3>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {mockGoals.map((g) => {
                  const isSelected = goal === g;
                  return (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`px-4.5 py-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary text-white font-bold"
                          : "border-border-color bg-surface hover:bg-background text-text-secondary"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: STICKY SUMMARY PANEL */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <Card className="border border-border-color bg-surface p-5 rounded-xl shadow-xs">
                <CardHeader className="p-0 pb-4 border-b border-border-color/50">
                  <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-1.5 select-none">
                    <Sliders className="h-4.5 w-4.5 text-primary" />
                    Quiz Configuration Summary
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0 pt-4 space-y-4 text-xs">
                  <div className="flex justify-between items-start border-b border-border-color/30 pb-3">
                    <span className="text-text-secondary font-medium">Selected Material</span>
                    <span className="font-bold text-text-primary text-right max-w-[150px] line-clamp-1 truncate">
                      {material?.name || "Operating Systems.pdf"}
                    </span>
                  </div>

                  <div className="flex justify-between items-start border-b border-border-color/30 pb-3">
                    <span className="text-text-secondary font-medium">Focus Topics</span>
                    <span className="font-bold text-text-primary text-right max-w-[150px]">
                      {selectedTopics.length} selected
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-border-color/30 pb-3">
                    <span className="text-text-secondary font-medium">Questions Count</span>
                    <span className="font-bold text-text-primary">
                      {activeCount} questions
                    </span>
                  </div>

                  <div className="flex justify-between items-start border-b border-border-color/30 pb-3">
                    <span className="text-text-secondary font-medium">Question Types</span>
                    <span className="font-bold text-text-primary text-right capitalize max-w-[150px]">
                      {selectedTypes.map((t) => mockQuestionTypes.find((q) => q.id === t)?.label || t).join(", ")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-border-color/30 pb-3">
                    <span className="text-text-secondary font-medium">Difficulty Level</span>
                    <span className="font-bold text-text-primary capitalize">
                      {difficulty}
                    </span>
                  </div>

                  <div className="flex justify-between items-start border-b border-border-color/30 pb-3">
                    <span className="text-text-secondary font-medium">Learning Goal</span>
                    <span className="font-bold text-text-primary text-right max-w-[150px]">
                      {goal}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-border-color/30 pb-3">
                    <span className="text-text-secondary font-medium">Estimated Time</span>
                    <span className="font-bold text-text-primary">
                      ~{estimatedTime} minutes
                    </span>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <Button
                      variant="primary"
                      disabled={!isValid}
                      onClick={handleGenerate}
                      className="w-full h-10.5 text-xs font-bold shadow-sm cursor-pointer"
                    >
                      Generate Quiz
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.back()}
                      className="w-full h-10.5 text-xs font-bold border-border-color/85 hover:bg-background cursor-pointer"
                    >
                      Cancel & Go Back
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {!isValid && (
                <div className="flex items-start gap-2.5 text-[11px] font-semibold text-error bg-error/5 border border-error/20 p-3 rounded-lg leading-normal shadow-xs select-none">
                  <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
                  <span>Configure a document, choose at least one topic, and specify a question type to enable quiz generation.</span>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
