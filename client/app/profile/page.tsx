"use client";

import * as React from "react";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  Layers,
  Award,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Zap,
  Shield,
  Star,
  FileText,
} from "lucide-react";

export default function ProfilePage() {
  
  // Mock achievements list
  const achievements = [
    {
      id: "ach-1",
      name: "7 Day Streak",
      desc: "Studied consecutively for 7 days.",
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      unlocked: true,
    },
    {
      id: "ach-2",
      name: "100 Questions",
      desc: "Answered 100+ questions.",
      icon: <CheckCircle2 className="h-5 w-5 text-indigo-500" />,
      unlocked: true,
    },
    {
      id: "ach-3",
      name: "First Quiz",
      desc: "Submitted your first quiz.",
      icon: <Award className="h-5 w-5 text-emerald-500" />,
      unlocked: true,
    },
    {
      id: "ach-4",
      name: "50 Flashcards",
      desc: "Reviewed 50+ cards.",
      icon: <Layers className="h-5 w-5 text-blue-500" />,
      unlocked: true,
    },
    {
      id: "ach-5",
      name: "Concept Master",
      desc: "Attained 90%+ mastery in any topic.",
      icon: <Shield className="h-5 w-5 text-rose-500" />,
      unlocked: false,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        <Topbar title="Learner Profile" />

        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8 font-sans">
          
          {/* USER AVATAR INFO PANEL */}
          <Card className="border border-border-color bg-surface p-6 sm:p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <Avatar
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256"
                fallback="JD"
                size="lg"
                className="ring-2 ring-primary/20"
              />
              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-text-primary">
                    John Doe
                  </h2>
                  <Badge variant="outline" className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary border-primary/25 bg-primary/5">
                    Premium Learner
                  </Badge>
                </div>
                <p className="text-xs text-text-secondary font-medium">
                  test@learnforge.ai &bull; Member since August 2026
                </p>
              </div>
            </div>
          </Card>

          {/* CORE LEARNING STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="border border-border-color bg-surface p-5 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                Current Streak
              </span>
              <span className="text-2xl font-extrabold text-text-primary block mt-2 flex items-center justify-center gap-1">
                <Zap className="h-5 w-5 text-amber-500 fill-current" />
                7 days
              </span>
            </Card>

            <Card className="border border-border-color bg-surface p-5 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                Questions Solved
              </span>
              <span className="text-2xl font-extrabold text-text-primary block mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                142
              </span>
            </Card>

            <Card className="border border-border-color bg-surface p-5 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                Cards Reviewed
              </span>
              <span className="text-2xl font-extrabold text-text-primary block mt-2 flex items-center justify-center gap-1">
                <Layers className="h-5 w-5 text-emerald-500" />
                84 cards
              </span>
            </Card>

            <Card className="border border-border-color bg-surface p-5 rounded-xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">
                Concepts Mastered
              </span>
              <span className="text-2xl font-extrabold text-text-primary block mt-2 flex items-center justify-center gap-1">
                <Award className="h-5 w-5 text-rose-500" />
                15 topics
              </span>
            </Card>
          </div>

          {/* TWO COLUMN GRID: ACHIEVEMENTS & SUMMARY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            
            {/* LEFT: TASTEFUL ACHIEVEMENTS LIST */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-bold text-text-primary text-base select-none">
                Achievements
              </h3>

              <div className="space-y-3.5">
                {achievements.map((ach) => (
                  <Card
                    key={ach.id}
                    className={`border p-4.5 rounded-xl flex items-start gap-4 transition-opacity duration-200 ${
                      ach.unlocked ? "border-border-color bg-surface" : "border-border-color/45 bg-surface/50 opacity-55"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg border shrink-0 ${
                      ach.unlocked ? "bg-background border-border-color/60" : "bg-slate-100 border-border-color/30"
                    }`}>
                      {ach.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-text-primary">
                          {ach.name}
                        </span>
                        {!ach.unlocked && (
                          <Badge variant="outline" className="text-[8px] uppercase tracking-wide px-1.5">
                            Locked
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {ach.desc}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* RIGHT: LEARNING SUMMARY & ACTIVITY */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Strength & Weak summaries */}
              <Card className="border border-border-color bg-surface p-5 rounded-xl space-y-4">
                <h3 className="font-bold text-text-primary text-xs border-b border-border-color/45 pb-3 select-none">
                  Learning Summary
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-text-secondary font-medium">Strongest Topic</span>
                    <span className="font-bold text-text-primary flex items-center gap-1.5 mt-0.5">
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                      Process Management (88% mastery)
                    </span>
                  </div>

                  <div className="space-y-1 border-t border-border-color/45 pt-3">
                    <span className="text-text-secondary font-medium">Needs Attention</span>
                    <span className="font-bold text-text-primary flex items-center gap-1.5 mt-0.5">
                      <BookOpen className="h-4 w-4 text-error" />
                      Deadlocks (42% mastery)
                    </span>
                  </div>
                </div>
              </Card>

              {/* Recent Activity summary */}
              <Card className="border border-border-color bg-surface p-5 rounded-xl space-y-4">
                <h3 className="font-bold text-text-primary text-xs border-b border-border-color/45 pb-3 select-none">
                  Recent Achievements Activity
                </h3>

                <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-border-color">
                  <div className="relative text-xs">
                    <span className="absolute -left-[18.5px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-surface" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-text-primary block leading-none">Unlocked 100 Questions Badge</span>
                      <span className="text-[9px] text-text-secondary/70 font-semibold block pt-0.5">Yesterday</span>
                    </div>
                  </div>

                  <div className="relative text-xs">
                    <span className="absolute -left-[18.5px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-surface" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-text-primary block leading-none">Unlocked 7 Day Streak Badge</span>
                      <span className="text-[9px] text-text-secondary/70 font-semibold block pt-0.5">3 days ago</span>
                    </div>
                  </div>
                </div>
              </Card>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
