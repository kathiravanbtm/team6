"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Layers,
  HelpCircle,
  FileText,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/learnforge/badges";
import { ProgressBar } from "@/components/ui/progress";
import { ToastContainer, toast } from "@/components/ui/toast";

export default function LandingPage() {
  // Hero Interactive Quiz State
  const [selectedHeroOption, setSelectedHeroOption] = React.useState<number | null>(null);
  const [isHeroSubmitted, setIsHeroSubmitted] = React.useState(false);

  const heroQuestion = {
    question: "Which organelle is responsible for generating chemical energy in the form of ATP?",
    options: [
      "Golgi Apparatus",
      "Mitochondrion",
      "Ribosome",
      "Lysosome",
    ],
    correctIndex: 1,
    explanation: "Correct! Mitochondria are known as the powerhouses of the cell. They perform cellular respiration, converting glucose and oxygen into adenosine triphosphate (ATP), the primary energy currency of the cell.",
  };

  const handleHeroSubmit = () => {
    if (selectedHeroOption === null) return;
    setIsHeroSubmitted(true);
    if (selectedHeroOption === heroQuestion.correctIndex) {
      toast("Correct Answer!", {
        type: "success",
        description: "Excellent job. Read the AI explanation below.",
      });
    } else {
      toast("Incorrect Option Chosen", {
        type: "error",
        description: "Review the explanation to learn why.",
      });
    }
  };

  const resetHeroQuiz = () => {
    setSelectedHeroOption(null);
    setIsHeroSubmitted(false);
  };

  // Logo Icon
  const LogoIcon = () => (
    <div className="relative h-6 w-6 text-primary flex items-center justify-center shrink-0">
      <BookOpen className="h-5.5 w-5.5 stroke-[2.5]" />
      <Sparkles className="absolute -top-1 -right-1 h-3 w-3 fill-current text-indigo-500 animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <ToastContainer />

      {/* TOP NAVIGATION HEADER */}
      <header className="h-16 md:h-20 border-b border-border-color bg-surface/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 md:px-12 w-full font-sans transition-all duration-300">
        <Link href="/" className="flex items-center gap-2 focus-ring rounded p-1">
          <LogoIcon />
          <span className="font-sans font-extrabold text-lg text-text-primary tracking-tight">
            LearnForge
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            How It Works
          </a>
          <a href="#preview" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Product Preview
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-sm font-semibold cursor-pointer">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm" className="text-sm font-semibold shadow-xs cursor-pointer">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
        {/* Left Side Copy */}
        <div className="lg:col-span-6 space-y-6 md:space-y-8 flex flex-col text-center lg:text-left items-center lg:items-start">
          <Badge variant="primary" className="py-1 px-3 text-xs tracking-wider font-semibold uppercase rounded-full">
            🚀 The Active Recall Lab
          </Badge>

          <h2 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-text-primary leading-tight font-sans tracking-tight max-w-xl">
            Turn your notes into <br />
            <span className="text-primary">your personal AI tutor.</span>
          </h2>

          <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-lg">
            Upload your study material and instantly turn it into quizzes, flashcards, explanations and personalized practice.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto px-8 py-3 text-base shadow-md group cursor-pointer">
                Start Learning
                <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-base cursor-pointer">
                See How It Works
              </Button>
            </a>
          </div>
        </div>

        {/* Right Side Quiz Preview */}
        <div className="lg:col-span-6 w-full flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-lg relative"
          >
            {/* Interactive Badge Indicator */}
            <div className="absolute -top-3.5 right-6 bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1 animate-bounce">
              <MousePointerClick className="h-3 w-3" />
              Try clicking
            </div>

            <Card className="border border-border-color/90 shadow-lg p-6 bg-surface rounded-xl font-sans relative">
              <div className="flex items-center justify-between border-b border-border-color pb-3 mb-5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Hero Quiz Playground
                  </span>
                </div>
                <DifficultyBadge difficulty="medium" />
              </div>

              {/* Progress */}
              <div className="flex justify-between items-center text-xs font-semibold text-text-secondary mb-2">
                <span>Active Concept: Biology</span>
                <span>Question 1 of 1</span>
              </div>
              <ProgressBar value={isHeroSubmitted ? 100 : 40} className="mb-5" />

              {/* Question */}
              <p className="text-base font-bold text-text-primary mb-5 leading-snug">
                {heroQuestion.question}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                {heroQuestion.options.map((option, idx) => {
                  const isSelected = selectedHeroOption === idx;
                  const isCorrect = heroQuestion.correctIndex === idx;
                  const isWrong = isSelected && !isCorrect;

                  let style = "border-border-color hover:bg-background";
                  let markerStyle = "border-border-color text-text-secondary";

                  if (isHeroSubmitted) {
                    if (isCorrect) {
                      style = "border-success bg-success/5 text-success font-medium";
                      markerStyle = "border-success bg-success text-white";
                    } else if (isWrong) {
                      style = "border-error bg-error/5 text-error font-medium";
                      markerStyle = "border-error bg-error text-white";
                    } else {
                      style = "border-border-color/50 opacity-60";
                    }
                  } else if (isSelected) {
                    style = "border-primary bg-primary/5 text-primary font-medium ring-2 ring-primary/20";
                    markerStyle = "border-primary bg-primary text-white";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isHeroSubmitted}
                      onClick={() => setSelectedHeroOption(idx)}
                      className={`w-full text-left p-3.5 border rounded-lg text-sm flex items-center justify-between transition-all duration-150 cursor-pointer focus:outline-none ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-6.5 w-6.5 rounded-full border text-[11px] font-bold flex items-center justify-center transition-colors ${markerStyle}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-text-primary font-medium leading-tight">{option}</span>
                      </div>
                      {isHeroSubmitted && isCorrect && <CheckCircle2 className="h-4.5 w-4.5 text-success shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-border-color/60 flex items-center justify-between">
                {isHeroSubmitted ? (
                  <Button variant="outline" size="sm" onClick={resetHeroQuiz} className="h-9 text-xs cursor-pointer">
                    Try Again
                  </Button>
                ) : (
                  <span className="text-xs text-text-secondary italic">
                    Select an option above to submit
                  </span>
                )}
                {!isHeroSubmitted ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={selectedHeroOption === null}
                    onClick={handleHeroSubmit}
                    className="h-9 text-xs cursor-pointer"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <span className="text-xs text-success font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Checked by AI
                  </span>
                )}
              </div>

              {/* Explanations */}
              {isHeroSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4.5 bg-background border border-border-color rounded-lg text-xs leading-relaxed text-text-secondary"
                >
                  <div className="flex items-center gap-2 mb-1.5 text-text-primary font-bold uppercase tracking-wider text-[10px]">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>AI Tutor Explanation</span>
                  </div>
                  {heroQuestion.explanation}
                </motion.div>
              )}
            </Card>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-surface border-y border-border-color/80 py-8 w-full">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-xs font-bold uppercase tracking-widest text-text-secondary select-none">
            Built for active learning
          </span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-sm font-semibold text-text-primary">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" /> Quizzes
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" /> Flashcards
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" /> Practice
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" /> Progress Tracking
            </span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-4 mb-16 md:mb-20">
          <Badge variant="outline" className="px-3 py-1 font-semibold uppercase tracking-wider text-xs">
            Simple 3-Step Flow
          </Badge>
          <h3 className="text-3xl font-extrabold tracking-tight text-text-primary">
            How It Works
          </h3>
          <p className="text-text-secondary text-sm md:text-base max-w-md mx-auto">
            Upload files and watch our engine structure, evaluate, and test your knowledge.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-[1px] border-t border-dashed border-border-color -z-10" />

          {/* Step 1 */}
          <motion.div
            whileHover={{ y: -4 }}
            className="flex flex-col items-center text-center p-6 bg-surface border border-border-color/60 rounded-xl shadow-xs"
          >
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-base font-extrabold mb-6 shadow-xs select-none">
              01
            </div>
            <h4 className="font-bold text-text-primary text-base mb-2">Upload</h4>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              Add your notes, articles or documents. Supports PDF, DOCX, TXT, and Markdown files.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            whileHover={{ y: -4 }}
            className="flex flex-col items-center text-center p-6 bg-surface border border-border-color/60 rounded-xl shadow-xs"
          >
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-base font-extrabold mb-6 shadow-xs select-none">
              02
            </div>
            <h4 className="font-bold text-text-primary text-base mb-2">Generate</h4>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              AI turns your material into structured learning content like quizzes and flashcards automatically.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            whileHover={{ y: -4 }}
            className="flex flex-col items-center text-center p-6 bg-surface border border-border-color/60 rounded-xl shadow-xs"
          >
            <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-base font-extrabold mb-6 shadow-xs select-none">
              03
            </div>
            <h4 className="font-bold text-text-primary text-base mb-2">Master</h4>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              Practice, review your mistakes, review analytical insights, and improve over time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FEATURE CARDS GRID */}
      <section id="features" className="bg-surface border-y border-border-color/60 py-20 md:py-28 px-6 md:px-12 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="primary" className="px-3 py-1 font-semibold uppercase tracking-wider text-xs">
              Lab Features
            </Badge>
            <h3 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Core Capabilities
            </h3>
            <p className="text-text-secondary text-sm md:text-base max-w-md mx-auto">
              Everything you need to stop rereading passive texts and start learning actively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <Card hoverLift asMotion className="border-border-color/80 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-2.5 bg-background border border-border-color/50 rounded-lg text-primary w-fit">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-text-primary text-base">AI Quiz Generation</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Turn long lecture handouts and slides into comprehensive diagnostic multiple choice or text questions.
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card hoverLift asMotion className="border-border-color/80 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-2.5 bg-background border border-border-color/50 rounded-lg text-primary w-fit">
                  <Layers className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-text-primary text-base">Smart Flashcards</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Generate definition cards with AI explanations to drill key concepts with active recall intervals.
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card hoverLift asMotion className="border-border-color/80 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-2.5 bg-background border border-border-color/50 rounded-lg text-primary w-fit">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-text-primary text-base">Detailed Explanations</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Receive personalized, context-based tutor explanations explaining why correct answers are right.
                </p>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card hoverLift asMotion className="border-border-color/80 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-2.5 bg-background border border-border-color/50 rounded-lg text-primary w-fit">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-text-primary text-base">Weak Topic Detection</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Our system keeps a ledger of past incorrect answers to isolate exactly what concepts need review.
                </p>
              </div>
            </Card>

            {/* Feature 5 */}
            <Card hoverLift asMotion className="border-border-color/80 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-2.5 bg-background border border-border-color/50 rounded-lg text-primary w-fit">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-text-primary text-base">Adaptive Practice</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Generates custom reinforcement checks based on previous questions you struggled to answer.
                </p>
              </div>
            </Card>

            {/* Feature 6 */}
            <Card hoverLift asMotion className="border-border-color/80 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-2.5 bg-background border border-border-color/50 rounded-lg text-primary w-fit">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-text-primary text-base">Learning Analytics</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Track weekly diagnostic scores, accuracy rates, and streaks to watch your score improve.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW SECTION */}
      <section id="preview" className="py-20 md:py-28 px-6 md:px-12 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 font-semibold uppercase tracking-wider text-xs">
            Realistic Dashboard
          </Badge>
          <h3 className="text-3xl font-extrabold tracking-tight text-text-primary">
            A serious dashboard for serious learning
          </h3>
          <p className="text-text-secondary text-sm md:text-base max-w-md mx-auto">
            Review detailed concept tracking, practice histories, and current streaks.
          </p>
        </div>

        {/* Dashboard Mockup Grid */}
        <div className="bg-background border border-border-color/90 rounded-2xl shadow-xl overflow-hidden font-sans">
          {/* Header */}
          <div className="bg-surface border-b border-border-color py-4 px-6 flex items-center justify-between text-xs text-text-secondary font-semibold">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-error" />
              <div className="h-3 w-3 rounded-full bg-warning" />
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="ml-2 font-mono tracking-tight text-text-secondary/70">
                app.learnforge.ai/dashboard
              </span>
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0.5 tracking-wider">
              Preview Mode
            </Badge>
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 p-6 md:p-8 gap-6 md:gap-8 bg-slate-50/50">
            {/* Left Metrics + Weak Topics */}
            <div className="lg:col-span-8 space-y-6">
              {/* Stat Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Stat 1 */}
                <Card className="p-4 border-border-color/60 bg-surface flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Weekly Practice Accuracy
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-text-primary">82%</span>
                    <span className="text-xs font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded">
                      +4.2%
                    </span>
                  </div>
                </Card>

                {/* Stat 2 */}
                <Card className="p-4 border-border-color/60 bg-surface flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Completed Quizzes
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-text-primary">14</span>
                    <span className="text-xs font-semibold text-text-secondary">
                      out of 18 total
                    </span>
                  </div>
                </Card>

                {/* Stat 3 */}
                <Card className="p-4 border-border-color/60 bg-surface flex flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                    Active Study Streak
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-text-primary">7 Days</span>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      Top 5%
                    </span>
                  </div>
                </Card>
              </div>

              {/* Weak Topics */}
              <Card className="p-6 border-border-color/60 bg-surface">
                <h4 className="font-bold text-text-primary text-sm mb-4 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Weak Topic Detection
                </h4>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-text-primary">
                        Mitochondrial DNA Mutations (Genetics)
                      </span>
                      <span className="text-error font-bold">42% Accuracy</span>
                    </div>
                    <div className="h-2 w-full bg-border-color/50 rounded-full overflow-hidden">
                      <div className="h-full bg-error rounded-full" style={{ width: "42%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-text-primary">
                        Krebs Cycle Intermediates (Biochemistry)
                      </span>
                      <span className="text-warning font-bold">58% Accuracy</span>
                    </div>
                    <div className="h-2 w-full bg-border-color/50 rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full" style={{ width: "58%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-text-primary">
                        Action Potential Depolarization (Neuroscience)
                      </span>
                      <span className="text-text-secondary font-bold">69% Accuracy</span>
                    </div>
                    <div className="h-2 w-full bg-border-color/50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/70 rounded-full" style={{ width: "69%" }} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Quick Actions / Streak Matrix */}
            <div className="lg:col-span-4 space-y-6">
              {/* Recent Material */}
              <Card className="p-5 border-border-color/60 bg-surface">
                <h4 className="font-bold text-text-primary text-sm mb-3.5">
                  Recent Quiz Activity
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 bg-background rounded-lg border border-border-color/30 text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-primary line-clamp-1">
                        Genetics Chapter 4
                      </span>
                      <span className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> 2 hours ago
                      </span>
                    </div>
                    <Badge variant="success">90%</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-background rounded-lg border border-border-color/30 text-xs">
                    <div className="flex flex-col">
                      <span className="font-semibold text-text-primary line-clamp-1">
                        Cell Respiration Review
                      </span>
                      <span className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> Yesterday
                      </span>
                    </div>
                    <Badge variant="success">80%</Badge>
                  </div>
                </div>
              </Card>

              {/* Study Streak Calendar Grid */}
              <Card className="p-5 border-border-color/60 bg-surface">
                <h4 className="font-bold text-text-primary text-sm mb-3.5 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  Study Streak
                </h4>
                {/* 7-day grid */}
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-text-secondary">
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                  <span>S</span>

                  <div className="h-8 rounded-md bg-success/20 border border-success/35 text-success font-extrabold flex items-center justify-center">
                    ✓
                  </div>
                  <div className="h-8 rounded-md bg-success/20 border border-success/35 text-success font-extrabold flex items-center justify-center">
                    ✓
                  </div>
                  <div className="h-8 rounded-md bg-success/20 border border-success/35 text-success font-extrabold flex items-center justify-center">
                    ✓
                  </div>
                  <div className="h-8 rounded-md bg-success/20 border border-success/35 text-success font-extrabold flex items-center justify-center">
                    ✓
                  </div>
                  <div className="h-8 rounded-md bg-success/20 border border-success/35 text-success font-extrabold flex items-center justify-center">
                    ✓
                  </div>
                  <div className="h-8 rounded-md bg-success/20 border border-success/35 text-success font-extrabold flex items-center justify-center">
                    ✓
                  </div>
                  <div className="h-8 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold flex items-center justify-center animate-pulse">
                    Today
                  </div>
                </div>
                <div className="mt-3.5 text-center text-xs text-text-secondary font-semibold">
                  🔥 Keep the flame going!
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="py-20 md:py-28 px-6 md:px-12 w-full max-w-4xl mx-auto text-center font-sans">
        <div className="bg-slate-900 border border-slate-800 text-white p-8 md:p-16 rounded-2xl space-y-6 md:space-y-8 relative overflow-hidden">
          {/* Subtle design helper absolute element */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            Stop rereading. <br className="sm:hidden" />
            <span className="text-indigo-400">Start practicing.</span>
          </h3>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Upload your materials today. Get full diagnostic insight, smart cards, and adaptive practice instantly.
          </p>

          <div className="flex justify-center pt-2">
            <Link href="/dashboard">
              <Button variant="primary" className="px-8 py-3 text-base shadow-lg bg-indigo-500 hover:bg-indigo-600 border-none cursor-pointer">
                Create Your Free Account
                <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-surface border-t border-border-color py-12 px-6 md:px-12 w-full font-sans">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          {/* Brand Info */}
          <div className="space-y-3.5 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon />
              <span className="font-sans font-extrabold text-lg text-text-primary tracking-tight">
                LearnForge
              </span>
            </Link>
            <p className="text-xs text-text-secondary max-w-xs">
              A premium AI-powered learning environment built for active recall, comprehension tracking, and targeted review.
            </p>
            <span className="text-xs text-text-secondary select-none">
              &copy; {new Date().getFullYear()} LearnForge Inc. All rights reserved.
            </span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 text-center md:text-left">
            <div className="space-y-3 flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Product
              </span>
              <a href="#features" className="text-xs text-text-secondary hover:text-text-primary transition-colors">
                Features
              </a>
              <Link href="/dashboard" className="text-xs text-text-secondary hover:text-text-primary transition-colors">
                Dashboard
              </Link>
            </div>

            <div className="space-y-3 flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                Company
              </span>
              <a href="#" className="text-xs text-text-secondary hover:text-text-primary transition-colors">
                About
              </a>
              <a href="#" className="text-xs text-text-secondary hover:text-text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-xs text-text-secondary hover:text-text-primary transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
