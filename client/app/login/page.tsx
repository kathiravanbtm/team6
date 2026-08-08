"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  FileText,
  BrainCircuit,
  HelpCircle,
  Award,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast, ToastContainer } from "@/components/ui/toast";

// Schema for login validation using Zod
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFields = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFields) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Emulate API authentication call
    setTimeout(() => {
      if (data.email === "test@learnforge.ai" && data.password === "password123") {
        toast("Success", {
          type: "success",
          description: "Sign in successful. Redirecting to workspace...",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setIsLoading(false);
        setErrorMessage("Invalid email or password. Use test@learnforge.ai / password123 to log in.");
        toast("Sign in failed", {
          type: "error",
          description: "Please check your login details and try again.",
        });
      }
    }, 1500);
  };


  const [view, setView] = React.useState<"login" | "forgot-password">("login");
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [isForgotLoading, setIsForgotLoading] = React.useState(false);
  const [forgotError, setForgotError] = React.useState<string | null>(null);

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError("Invalid email address");
      return;
    }

    setForgotError(null);
    setIsForgotLoading(true);

    setTimeout(() => {
      setIsForgotLoading(false);
      toast("Reset link sent!", {
        type: "success",
        description: `We've sent a recovery link to ${forgotEmail}.`,
      });
      setTimeout(() => {
        setView("login");
        setForgotEmail("");
      }, 1500);
    }, 1500);
  };

  // Spark Book Brand Logo
  const Logo = () => (
    <div className="flex items-center gap-2 select-none">
      <div className="relative h-6 w-6 text-primary flex items-center justify-center shrink-0">
        <BookOpen className="h-5.5 w-5.5 stroke-[2.5]" />
        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 fill-current text-indigo-500 animate-pulse" />
      </div>
      <span className="font-sans font-extrabold text-lg text-text-primary dark:text-white tracking-tight">
        LearnForge
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background grid grid-cols-1 lg:grid-cols-12 font-sans selection:bg-primary/20 selection:text-primary">
      <ToastContainer />

      {/* LEFT: MINIMAL BRAND PANEL (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle design gradient elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="z-10 flex items-center gap-2">
          <div className="relative h-6 w-6 text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="h-5.5 w-5.5 stroke-[2.5]" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 fill-current text-indigo-300 animate-pulse" />
          </div>
          <span className="font-sans font-extrabold text-lg tracking-tight">
            LearnForge
          </span>
        </div>

        {/* Center content */}
        <div className="z-10 space-y-12">
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
              Your study material. <br />
              <span className="text-indigo-400">Your learning path.</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Upload notes or textbooks and watch our engine structure, evaluate, and test your knowledge in real-time.
            </p>
          </div>

          {/* Flow Diagram representing: document -> AI -> quiz -> mastery */}
          <div className="space-y-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              The Active Loop
            </span>

            <div className="flex items-center gap-2">
              {/* Node 1: Document */}
              <div className="bg-slate-800/85 border border-slate-700/60 p-3 rounded-lg flex flex-col items-center gap-1.5 w-20 text-center shrink-0">
                <FileText className="h-5 w-5 text-indigo-400" />
                <span className="text-[9px] font-bold text-slate-300 leading-none">
                  Document
                </span>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />

              {/* Node 2: AI */}
              <div className="bg-slate-800/85 border border-slate-700/60 p-3 rounded-lg flex flex-col items-center gap-1.5 w-20 text-center shrink-0">
                <BrainCircuit className="h-5 w-5 text-indigo-400" />
                <span className="text-[9px] font-bold text-slate-300 leading-none">
                  AI Engine
                </span>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />

              {/* Node 3: Quiz */}
              <div className="bg-slate-800/85 border border-slate-700/60 p-3 rounded-lg flex flex-col items-center gap-1.5 w-20 text-center shrink-0">
                <HelpCircle className="h-5 w-5 text-indigo-400" />
                <span className="text-[9px] font-bold text-slate-300 leading-none">
                  Practice Quiz
                </span>
              </div>

              <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />

              {/* Node 4: Mastery */}
              <div className="bg-slate-800/85 border border-slate-700/60 p-3 rounded-lg flex flex-col items-center gap-1.5 w-20 text-center shrink-0 ring-1 ring-indigo-500/35 bg-indigo-950/20">
                <Award className="h-5 w-5 text-indigo-400 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-200 leading-none">
                  Mastery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 text-[10px] text-slate-500 select-none">
          &copy; {new Date().getFullYear()} LearnForge Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT: LOGIN / FORGOT PASSWORD CARD */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-12 bg-background">
        {/* Compact Logo Header on Mobile only */}
        <div className="lg:hidden w-full max-w-md mb-8 flex justify-start">
          <Logo />
        </div>

        <Card className="w-full max-w-md border-border-color bg-surface shadow-md p-6 sm:p-8 rounded-xl min-h-[400px] flex flex-col justify-between">
          {view === "login" ? (
            <>
              <div>
                <div className="space-y-1.5 mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-text-primary">
                    Welcome back
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Continue where you left off.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Server Error Alert */}
                  {errorMessage && (
                    <div className="flex items-start gap-2.5 text-xs font-semibold text-error bg-error/5 border border-error/20 p-3 rounded-lg leading-snug">
                      <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary block">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 h-4.5 w-4.5 text-text-secondary pointer-events-none" />
                      <input
                        type="email"
                        disabled={isLoading}
                        placeholder="name@example.com"
                        className={`h-10.5 w-full pl-10.5 pr-4.5 rounded-lg border bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 ${
                          errors.email ? "border-error focus:ring-error/20" : "border-border-color"
                        }`}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] font-semibold text-error">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-text-secondary">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setView("forgot-password");
                          setErrorMessage(null);
                        }}
                        className="text-xs font-medium text-primary hover:underline cursor-pointer focus:outline-none"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 h-4.5 w-4.5 text-text-secondary pointer-events-none" />
                      <input
                        type="password"
                        disabled={isLoading}
                        placeholder="••••••••"
                        className={`h-10.5 w-full pl-10.5 pr-4.5 rounded-lg border bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 ${
                          errors.password ? "border-error focus:ring-error/20" : "border-border-color"
                        }`}
                        {...register("password")}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-[11px] font-semibold text-error">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    className="w-full h-11 text-sm font-semibold tracking-wide shadow-sm mt-2 cursor-pointer"
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </div>

              {/* Bottom links */}
              <div className="mt-8 pt-4 border-t border-border-color/50 text-center text-xs">
                <span className="text-text-secondary mr-1">
                  Don&apos;t have an account?
                </span>
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  Create account
                </Link>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="space-y-1.5 mb-6">
                  <h2 className="text-xl font-bold tracking-tight text-text-primary">
                    Reset password
                  </h2>
                  <p className="text-xs text-text-secondary">
                    Enter your email address and we&apos;ll send you a recovery link.
                  </p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-secondary block">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 h-4.5 w-4.5 text-text-secondary pointer-events-none" />
                      <input
                        type="email"
                        disabled={isForgotLoading}
                        placeholder="name@example.com"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          if (forgotError) setForgotError(null);
                        }}
                        className={`h-10.5 w-full pl-10.5 pr-4.5 rounded-lg border bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 ${
                          forgotError ? "border-error focus:ring-error/20" : "border-border-color"
                        }`}
                      />
                    </div>
                    {forgotError && (
                      <p className="text-[11px] font-semibold text-error">
                        {forgotError}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isForgotLoading}
                    className="w-full h-11 text-sm font-semibold tracking-wide shadow-sm mt-2 cursor-pointer"
                  >
                    {isForgotLoading ? "Sending reset link..." : "Send reset link"}
                  </Button>
                </form>
              </div>

              {/* Bottom links */}
              <div className="mt-8 pt-4 border-t border-border-color/50 text-center text-xs">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="font-semibold text-primary hover:underline cursor-pointer focus:outline-none"
                >
                  Back to sign in
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
