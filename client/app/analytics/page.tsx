"use client";

import * as React from "react";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/learnforge/stat-card";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast, ToastContainer } from "@/components/ui/toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  Clock,
  Lightbulb,
  ArrowRight,
  Brain,
} from "lucide-react";

// Mock accuracy timelines by range
const mockTimelineData = {
  "7": [
    { name: "Mon", accuracy: 72 },
    { name: "Tue", accuracy: 75 },
    { name: "Wed", accuracy: 70 },
    { name: "Thu", accuracy: 82 },
    { name: "Fri", accuracy: 80 },
    { name: "Sat", accuracy: 85 },
    { name: "Sun", accuracy: 82 },
  ],
  "30": [
    { name: "Week 1", accuracy: 68 },
    { name: "Week 2", accuracy: 74 },
    { name: "Week 3", accuracy: 78 },
    { name: "Week 4", accuracy: 82 },
  ],
  "90": [
    { name: "Month 1", accuracy: 65 },
    { name: "Month 2", accuracy: 72 },
    { name: "Month 3", accuracy: 82 },
  ],
};

const topicMastery = [
  { name: "Operating Systems", mastery: 82, color: "bg-primary" },
  { name: "Data Structures & Algorithms", mastery: 89, color: "bg-success" },
  { name: "Database Management Systems", mastery: 74, color: "bg-warning" },
  { name: "Computer Networks", mastery: 68, color: "bg-error" },
];

export default function AnalyticsPage() {
  const [range, setRange] = React.useState<"7" | "30" | "90">("7");

  const handleNextStep = () => {
    toast("Opening Deadlocks practice test...", {
      type: "success",
      description: "Generating 10 questions.",
    });
  };

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        <Topbar title="Learning Analytics" subtitle="Understand how you're improving." />

        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8 font-sans">
          
          {/* STATS SUMMARY ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Average accuracy"
              value="82%"
              icon={<TrendingUp className="h-5 w-5" />}
              description="+2.1% from last month"
              progress={82}
            />
            <StatCard
              title="Questions solved"
              value="142"
              icon={<CheckCircle2 className="h-5 w-5" />}
              description="+14 from yesterday"
              progress={70}
            />
            <StatCard
              title="Study time"
              value="12.4 hrs"
              icon={<Clock className="h-5 w-5" />}
              description="Top 10% this week"
              progress={90}
            />
            <StatCard
              title="Current streak"
              value="7 days"
              icon={<Calendar className="h-5 w-5" />}
              description="+2 from last week"
              progress={100}
            />
          </div>

          {/* ACCURACY OVER TIME LINE CHART */}
          <Card className="border border-border-color bg-surface p-6 rounded-xl">
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-border-color/45 pb-4 mb-6">
              <div className="space-y-0.5">
                <h3 className="font-bold text-text-primary text-sm select-none">
                  Accuracy Over Time
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Percentage of questions answered correctly.
                </p>
              </div>

              {/* Day range filters */}
              <div className="flex items-center bg-background border border-border-color p-1 rounded-lg select-none">
                {(["7", "30", "90"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      range === r
                        ? "bg-surface text-text-primary shadow-xs font-bold"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {r} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Wrapper */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTimelineData[range]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "sans-serif",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    dot={{ fill: "#4F46E5", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* TWO COLUMN SUMMARY SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            
            {/* LEFT: TOPIC MASTERY */}
            <Card className="border border-border-color bg-surface p-5 rounded-xl space-y-4">
              <h3 className="font-bold text-text-primary text-sm border-b border-border-color/45 pb-3 select-none">
                Topic Mastery
              </h3>
              
              <div className="space-y-4">
                {topicMastery.map((topic) => (
                  <div key={topic.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-text-primary">{topic.name}</span>
                      <span className="text-text-secondary">{topic.mastery}%</span>
                    </div>
                    <ProgressBar value={topic.mastery} className={`${topic.color}/10`} />
                  </div>
                ))}
              </div>
            </Card>

            {/* RIGHT: DIFFICULTY COMPARISON & AI INSIGHTS */}
            <div className="space-y-6">
              
              {/* Difficulty accuracy metrics */}
              <Card className="border border-border-color bg-surface p-5 rounded-xl space-y-4">
                <h3 className="font-bold text-text-primary text-sm border-b border-border-color/45 pb-3 select-none">
                  Accuracy by Difficulty
                </h3>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3.5 bg-success/5 border border-success/15 rounded-lg space-y-1">
                    <span className="text-success text-lg font-extrabold block">92%</span>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      Easy
                    </span>
                  </div>
                  <div className="p-3.5 bg-warning/5 border border-warning/15 rounded-lg space-y-1">
                    <span className="text-warning text-lg font-extrabold block">78%</span>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      Medium
                    </span>
                  </div>
                  <div className="p-3.5 bg-error/5 border border-error/15 rounded-lg space-y-1">
                    <span className="text-error text-lg font-extrabold block">54%</span>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                      Hard
                    </span>
                  </div>
                </div>
              </Card>

              {/* AI Insights Card */}
              <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-5">
                <h3 className="font-bold text-text-primary text-sm flex items-center gap-1.5 select-none">
                  <Lightbulb className="h-4.5 w-4.5 text-primary animate-pulse" />
                  Personal Insights
                </h3>

                <div className="space-y-3.5 text-xs text-text-secondary font-medium leading-relaxed">
                  <p>
                    ✓ You are improving fastest in **CPU Scheduling**, showing a 15% increase in accuracy over the last 30 days.
                  </p>
                  <p>
                    ⚠ **Deadlocks** concepts remain your weakest area, drag-testing down your average accuracy on operating systems modules.
                  </p>
                </div>

                <div className="border-t border-border-color/50 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleNextStep}
                    className="w-full h-9.5 text-xs font-semibold cursor-pointer"
                  >
                    Try targeted practice (10 questions)
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
