"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { StatCard } from "@/components/learnforge/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/learnforge/badges";
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  Clock,
  BookOpen,
  ArrowRight,
  Brain,
  HelpCircle,
  FileText,
  ChevronRight,
  Zap,
} from "lucide-react";
import { toast, ToastContainer } from "@/components/ui/toast";

export default function DashboardPage() {
  const router = useRouter();

  // Mock data for weak topics
  const weakTopics = [
    { name: "Deadlocks", accuracy: 42, color: "bg-error" },
    { name: "CPU Scheduling", accuracy: 61, color: "bg-warning" },
    { name: "Memory Management", accuracy: 68, color: "bg-primary" },
  ];

  // Mock data for timeline
  const activities = [
    {
      id: "act-1",
      type: "quiz",
      title: "Completed quiz",
      desc: 'Mitochondrial Genetics Quiz',
      time: "3 hours ago",
      icon: <HelpCircle className="h-4 w-4 text-indigo-500" />,
      color: "border-indigo-500 bg-indigo-50",
    },
    {
      id: "act-2",
      type: "flashcards",
      title: "Reviewed flashcards",
      desc: 'Krebs Cycle paths (Genetics Deck)',
      time: "Yesterday",
      icon: <BookOpen className="h-4 w-4 text-emerald-500" />,
      color: "border-emerald-500 bg-emerald-50",
    },
    {
      id: "act-3",
      type: "upload",
      title: "Uploaded document",
      desc: 'Action Potential summary notes.md',
      time: "2 days ago",
      icon: <FileText className="h-4 w-4 text-amber-500" />,
      color: "border-amber-500 bg-amber-50",
    },
    {
      id: "act-4",
      type: "practice",
      title: "Completed practice session",
      desc: 'Maternal Inheritance review',
      time: "3 days ago",
      icon: <CheckCircle2 className="h-4 w-4 text-rose-500" />,
      color: "border-rose-500 bg-rose-50",
    },
  ];

  const handlePracticeTopic = (topicName: string) => {
    toast(`Launching custom practice for ${topicName}...`, {
      type: "info",
      description: "Generating AI reinforce checks.",
    });
    setTimeout(() => {
      router.push("/quizzes");
    }, 1000);
  };

  const handleContinueLearning = () => {
    toast("Loading Operating Systems study module...", {
      type: "success",
      description: "Taking you to CPU Scheduling review.",
    });
    setTimeout(() => {
      router.push("/study-materials");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Panel Frame */}
      <div className="flex flex-col flex-1 md:pl-[240px]">
        {/* HEADER */}
        <Topbar
          title="Good morning, there."
          subtitle="Ready to continue learning?"
        />

        {/* CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8 font-sans">
          
          {/* STATS SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Current streak"
              value="7 days"
              icon={<Calendar className="h-5 w-5" />}
              description="+2 from last week"
              progress={100}
            />
            <StatCard
              title="Questions solved"
              value="142"
              icon={<CheckCircle2 className="h-5 w-5" />}
              description="+14 from yesterday"
              progress={75}
            />
            <StatCard
              title="Average accuracy"
              value="82%"
              icon={<TrendingUp className="h-5 w-5" />}
              trend={{ value: "+1.2%", type: "positive" }}
              description="this week"
            />
            <StatCard
              title="Study time"
              value="4.5 hrs"
              icon={<Clock className="h-5 w-5" />}
              description="Top 10% this week"
              progress={90}
            />
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            {/* LEFT MAIN COLUMN: Continue Learning & Weak Topics */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* CONTINUE LEARNING - HERO FEATURED CARD */}
              <Card className="border border-border-color bg-surface rounded-xl overflow-hidden shadow-xs relative">
                {/* Visual highlights */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded">
                        Course Unit
                      </span>
                      <h3 className="text-xl font-extrabold tracking-tight text-text-primary pt-1.5">
                        Operating Systems
                      </h3>
                    </div>
                    <Badge variant="outline" className="px-2.5 py-0.5 rounded-full font-medium text-xs">
                      Active Unit
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-text-secondary">
                      <span>Continue your progress</span>
                      <span>78% Mastered</span>
                    </div>
                    <ProgressBar value={78} />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-border-color/50 gap-4">
                    <div className="text-xs">
                      <span className="text-text-secondary font-medium">Current topic:</span>
                      <span className="text-text-primary font-bold ml-1 flex items-center gap-1.5 mt-0.5">
                        <Brain className="h-3.5 w-3.5 text-primary shrink-0" />
                        CPU Scheduling
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleContinueLearning}
                      className="w-full sm:w-auto px-6 h-9.5 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Continue
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* WEAK TOPICS SECTION */}
              <div className="space-y-4">
                <h4 className="font-bold text-text-primary text-base select-none">
                  Weak Topics
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {weakTopics.map((topic) => (
                    <Card key={topic.name} className="border border-border-color bg-surface p-5 rounded-lg flex flex-col justify-between hover:shadow-xs transition-shadow duration-200">
                      <div>
                        <h5 className="font-bold text-text-primary text-sm line-clamp-1 leading-snug">
                          {topic.name}
                        </h5>
                        <span className="text-[11px] font-bold text-error block mt-1.5">
                          {topic.accuracy}% Accuracy
                        </span>
                      </div>

                      <div className="mt-5 space-y-3.5">
                        <div className="h-1.5 w-full bg-border-color/50 rounded-full overflow-hidden">
                          <div className={`h-full ${topic.color} rounded-full`} style={{ width: `${topic.accuracy}%` }} />
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => handlePracticeTopic(topic.name)}
                          className="w-full h-8.5 text-[11px] font-semibold tracking-wide border-border-color/80 hover:bg-background cursor-pointer"
                        >
                          Practice
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR COLUMN: Today's Goal & Activity */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* TODAY'S GOAL (Circular Progress) */}
              <Card className="border border-border-color bg-surface p-6 rounded-xl text-center flex flex-col items-center justify-between">
                <div className="w-full border-b border-border-color/55 pb-3.5 mb-5 flex justify-between items-center text-xs font-bold text-text-secondary select-none uppercase tracking-wider">
                  <span>Today&apos;s Goal</span>
                  <Zap className="h-4 w-4 text-primary fill-current animate-pulse" />
                </div>

                <div className="relative mb-5 flex justify-center">
                  <ProgressRing value={80} size={90} strokeWidth={8} showText={false} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                    <span className="text-lg font-extrabold text-text-primary leading-none">
                      24 / 30
                    </span>
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mt-1">
                      solved
                    </span>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  <p className="text-xs text-text-secondary leading-normal max-w-[200px] mx-auto font-medium">
                    6 more questions to reach today&apos;s goal.
                  </p>

                  <Button
                    variant="secondary"
                    onClick={() => router.push("/quizzes")}
                    className="w-full h-9.5 text-xs font-semibold cursor-pointer"
                  >
                    Keep Practicing
                  </Button>
                </div>
              </Card>

              {/* RECENT ACTIVITY TIMELINE */}
              <Card className="border border-border-color bg-surface p-6 rounded-xl">
                <h4 className="font-bold text-text-primary text-sm border-b border-border-color/55 pb-3.5 mb-5 select-none">
                  Recent Activity
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-border-color/85">
                  {activities.map((item) => (
                    <div key={item.id} className="relative text-xs">
                      {/* Timeline Dot */}
                      <span className={`absolute -left-[21.5px] top-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center ${item.color} z-10`}>
                        {item.icon}
                      </span>

                      <div className="space-y-0.5">
                        <span className="font-bold text-text-primary block leading-none">
                          {item.title}
                        </span>
                        <span className="text-text-secondary text-[11px] block truncate max-w-[190px]">
                          {item.desc}
                        </span>
                        <span className="text-[10px] text-text-secondary/70 font-semibold block pt-0.5">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
