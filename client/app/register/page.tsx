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
  CheckCircle2,
  User,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast, ToastContainer } from "@/components/ui/toast";

// Schema for registration validation using Zod
const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterFields = z.infer<typeof registerSchema>;

// Password strength evaluator helper
interface StrengthScore {
  score: number; // 0 to 4
  label: "Weak" | "Fair" | "Good" | "Strong";
  color: string;
}

const getPasswordStrength = (pass: string): StrengthScore => {
  if (!pass) return { score: 0, label: "Weak", color: "bg-border-color" };

  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[a-z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  const configs: Record<number, Omit<StrengthScore, "score">> = {
    0: { label: "Weak", color: "bg-error" },
    1: { label: "Weak", color: "bg-error" },
    2: { label: "Fair", color: "bg-warning" },
    3: { label: "Good", color: "bg-primary" },
    4: { label: "Strong", color: "bg-success" },
  };

  return {
    score,
    ...(configs[score] || { label: "Weak", color: "bg-error" }),
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: undefined,
    },
  });

  const passwordVal = watch("password", "");
  const strength = getPasswordStrength(passwordVal);

  const onSubmit = async (data: RegisterFields) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Emulate API register call
    setTimeout(() => {
      if (data.email === "existing@learnforge.ai") {
        setIsLoading(false);
        setErrorMessage("An account with this email already exists.");
        toast("Registration failed", {
          type: "error",
          description: "Try signing in or use a different email.",
        });
      } else {
        toast("Account Created!", {
          type: "success",
          description: "Redirecting to your study workspace...",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
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

      {/* LEFT: SLICK BENEFITS PANEL (Desktop Only) */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Design gradients */}
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

        {/* Core Benefits */}
        <div className="z-10 space-y-10">
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
              Start learning <br />
              <span className="text-indigo-400">smarter.</span>
            </h1>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Create an account and immediately unlock tools to reinforce active recall, study structure, and concepts.
            </p>
          </div>

          <div className="space-y-6">
            {/* Benefit 1 */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100 text-sm leading-tight">
                  Turn notes into quizzes
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Extract definitions, processes, and concepts directly into diagnostic test sheets.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100 text-sm leading-tight">
                  Build smart flashcards
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Recall terms using flipping cards backed by custom AI-tutor explanations.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100 text-sm leading-tight">
                  Track weak topics
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Diagnostic ledgers highlight error metrics to help isolate which chapters need review.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="z-10 text-[10px] text-slate-500 select-none">
          &copy; {new Date().getFullYear()} LearnForge Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT: REGISTRATION FORM */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-12 bg-background">
        {/* Compact Logo Header on Mobile */}
        <div className="lg:hidden w-full max-w-md mb-8 flex justify-start">
          <Logo />
        </div>

        <Card className="w-full max-w-md border-border-color bg-surface shadow-md p-6 sm:p-8 rounded-xl">
          <div className="space-y-1.5 mb-6">
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              Create account
            </h2>
            <p className="text-xs text-text-secondary">
              Fill in your details to start learning smarter.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Server Error */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 text-xs font-semibold text-error bg-error/5 border border-error/20 p-3 rounded-lg leading-snug"
              >
                <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4.5 w-4.5 text-text-secondary pointer-events-none" />
                <input
                  type="text"
                  disabled={isLoading}
                  placeholder="John Doe"
                  className={`h-10.5 w-full pl-10.5 pr-4.5 rounded-lg border bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 ${
                    errors.name ? "border-error focus:ring-error/20" : "border-border-color"
                  }`}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-[11px] font-semibold text-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">
                Password
              </label>
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

              {/* Password Strength Visualization */}
              {passwordVal.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary">
                    <span>Password Strength:</span>
                    <span
                      className={
                        strength.label === "Weak"
                          ? "text-error"
                          : strength.label === "Fair"
                          ? "text-warning"
                          : strength.label === "Good"
                          ? "text-primary"
                          : "text-success"
                      }
                    >
                      {strength.label}
                    </span>
                  </div>
                  {/* Strength Bar */}
                  <div className="h-1.5 w-full bg-border-color rounded-full overflow-hidden flex gap-0.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-full flex-1 transition-all duration-300 ${
                          i < strength.score ? strength.color : "bg-border-color/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-[11px] font-semibold text-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4.5 w-4.5 text-text-secondary pointer-events-none" />
                <input
                  type="password"
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={`h-10.5 w-full pl-10.5 pr-4.5 rounded-lg border bg-surface text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 ${
                    errors.confirmPassword ? "border-error focus:ring-error/20" : "border-border-color"
                  }`}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-semibold text-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms acknowledgement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  className="rounded border-border-color text-primary focus:ring-primary/20 h-4 w-4 mt-0.5 cursor-pointer accent-primary"
                  {...register("terms")}
                />
                <span className="text-xs leading-normal text-text-secondary">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-[11px] font-semibold text-error mt-1">
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full h-11 text-sm font-semibold tracking-wide shadow-sm mt-3 cursor-pointer"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Bottom redirection link */}
          <div className="mt-8 pt-4 border-t border-border-color/50 text-center text-xs">
            <span className="text-text-secondary mr-1">
              Already have an account?
            </span>
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
