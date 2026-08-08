"use client";

import * as React from "react";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "@/components/ui/toast";
import {
  User,
  Sliders,
  Bell,
  Palette,
  ShieldAlert,
  Save,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"profile" | "preferences" | "notifications" | "appearance" | "security">("profile");

  // Profile fields
  const [name, setName] = React.useState("John Doe");
  const [email, setEmail] = React.useState("test@learnforge.ai");

  // Preferences fields
  const [difficulty, setDifficulty] = React.useState("adaptive");
  const [dailyGoal, setDailyGoal] = React.useState(30);
  
  // Notification options
  const [notifyStudy, setNotifyStudy] = React.useState(true);
  const [notifyQuiz, setNotifyQuiz] = React.useState(false);

  // Appearance
  const [theme, setTheme] = React.useState("dark");

  // Password fields
  const [currPassword, setCurrPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");

  const handleSave = (section: string) => {
    toast(`Saved settings for ${section}`, {
      type: "success",
      description: "Changes updated in your profile preferences.",
    });
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm("Are you sure you want to permanently delete your LearnForge account? This action is irreversible.");
    if (confirm) {
      toast("Account deletion simulated.", { type: "info" });
    }
  };

  const menuItems = [
    { id: "profile", label: "Profile Settings", icon: <User className="h-4 w-4" /> },
    { id: "preferences", label: "Learning Preferences", icon: <Sliders className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
    { id: "security", label: "Security & Danger Zone", icon: <ShieldAlert className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        <Topbar title="Settings" />

        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          {/* LEFT TAB COLUMN */}
          <div className="lg:col-span-4 space-y-2 select-none">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-3 transition-all cursor-pointer focus:outline-none ${
                  activeTab === item.id
                    ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
                    : "border-border-color bg-surface hover:bg-background text-text-secondary"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* RIGHT CONTENT COLUMN */}
          <div className="lg:col-span-8">
            
            {/* PROFILE PANEL */}
            {activeTab === "profile" && (
              <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-6">
                <div>
                  <h3 className="font-bold text-text-primary text-sm leading-snug">
                    Profile Settings
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-1">
                    Manage your personal account credentials.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 w-full px-3.5 rounded-lg border border-border-color bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full px-3.5 rounded-lg border border-border-color bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => handleSave("Profile")}
                    className="h-9.5 text-xs font-semibold cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Save Profile
                  </Button>
                </div>
              </Card>
            )}

            {/* PREFERENCES PANEL */}
            {activeTab === "preferences" && (
              <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-6">
                <div>
                  <h3 className="font-bold text-text-primary text-sm leading-snug">
                    Learning Preferences
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-1">
                    Configure question counts and adaptive defaults.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary block">
                      Preferred Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="h-10 w-full px-3 rounded-lg border border-border-color bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="adaptive">Adaptive (Recommended)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary block">
                      Daily Question Goal
                    </label>
                    <input
                      type="number"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(parseInt(e.target.value, 10) || 10)}
                      className="h-10 w-full px-3.5 rounded-lg border border-border-color bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => handleSave("Preferences")}
                    className="h-9.5 text-xs font-semibold cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </Card>
            )}

            {/* NOTIFICATIONS PANEL */}
            {activeTab === "notifications" && (
              <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-6">
                <div>
                  <h3 className="font-bold text-text-primary text-sm leading-snug">
                    Notifications
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-1">
                    Manage when you receive study reminders and alerts.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifyStudy}
                      onChange={(e) => setNotifyStudy(e.target.checked)}
                      className="rounded border-border-color text-primary focus:ring-primary/20 h-4 w-4 mt-0.5 cursor-pointer accent-primary"
                    />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-text-primary">Daily study reminder</span>
                      <p className="text-text-secondary leading-normal">
                        Receive a notification when your daily target goals are due for review.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifyQuiz}
                      onChange={(e) => setNotifyQuiz(e.target.checked)}
                      className="rounded border-border-color text-primary focus:ring-primary/20 h-4 w-4 mt-0.5 cursor-pointer accent-primary"
                    />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-text-primary">Quiz completion reports</span>
                      <p className="text-text-secondary leading-normal">
                        Receive email summaries mapping topic mastery statistics after submitting tests.
                      </p>
                    </div>
                  </label>

                  <Button
                    variant="primary"
                    onClick={() => handleSave("Notifications")}
                    className="h-9.5 text-xs font-semibold cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Save Notifications
                  </Button>
                </div>
              </Card>
            )}

            {/* APPEARANCE PANEL */}
            {activeTab === "appearance" && (
              <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-6">
                <div>
                  <h3 className="font-bold text-text-primary text-sm leading-snug">
                    Appearance Theme
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-1">
                    Select a color scheme for your study workspace.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 select-none">
                  {(["light", "dark", "system"] as const).map((t) => {
                    const isSelected = theme === t;
                    return (
                      <Card
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`cursor-pointer p-4 border rounded-xl text-center capitalize transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 font-bold"
                            : "border-border-color bg-surface hover:bg-background text-text-secondary"
                        }`}
                      >
                        <h4 className="text-xs font-bold">{t} Theme</h4>
                      </Card>
                    );
                  })}
                </div>

                <Button
                  variant="primary"
                  onClick={() => handleSave("Appearance")}
                  className="h-9.5 text-xs font-semibold cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Save Theme
                </Button>
              </Card>
            )}

            {/* SECURITY & DANGER ZONE */}
            {activeTab === "security" && (
              <div className="space-y-6">
                
                {/* Security change password */}
                <Card className="border border-border-color bg-surface p-6 rounded-xl space-y-6">
                  <div>
                    <h3 className="font-bold text-text-primary text-sm leading-snug">
                      Change Password
                    </h3>
                    <p className="text-[11px] text-text-secondary mt-1">
                      Update your account security credentials.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary block">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currPassword}
                        onChange={(e) => setCurrPassword(e.target.value)}
                        className="h-10 w-full px-3.5 rounded-lg border border-border-color bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-secondary"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-secondary block">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-10 w-full px-3.5 rounded-lg border border-border-color bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-text-secondary"
                      />
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => {
                        handleSave("Security");
                        setCurrPassword("");
                        setNewPassword("");
                      }}
                      className="h-9.5 text-xs font-semibold cursor-pointer"
                    >
                      Change Password
                    </Button>
                  </div>
                </Card>

                {/* Danger zone delete */}
                <Card className="border border-error/30 bg-error/5 p-6 rounded-xl space-y-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-error shrink-0 mt-0.5" />
                    <div className="space-y-1 select-none">
                      <h4 className="font-bold text-text-primary text-sm leading-none">
                        Danger Zone
                      </h4>
                      <p className="text-xs text-text-secondary leading-normal">
                        Permanently delete your account. This action cannot be undone and all metrics, study timelines, files, and quizzes will be lost.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleDeleteAccount}
                    className="h-9.5 text-xs font-semibold border-error text-error hover:bg-error/10 cursor-pointer"
                  >
                    Delete Account
                  </Button>
                </Card>

              </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}
