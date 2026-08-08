"use client";

import { create } from "zustand";

export interface QuizConfig {
  materialId: string;
  materialName: string;
  selectedTopics: string[];
  questionCount: number;
  questionTypes: string[];
  difficulty: "easy" | "medium" | "hard" | "adaptive";
  learningGoal: string;
  mode: "practice" | "exam";
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: string;
  pageReference?: number;
}

export interface QuizState {
  // Config
  config: QuizConfig | null;
  setConfig: (config: QuizConfig) => void;
  
  // Active Quiz Session
  activeQuizId: string | null;
  questions: QuizQuestion[];
  userAnswers: Record<string, number | string>; // maps questionId to selectedOptionIndex or shortAnswerText
  isSubmitted: boolean;
  timeRemaining: number; // in seconds
  
  // Actions
  startQuiz: (quizId: string, questions: QuizQuestion[], mode: "practice" | "exam") => void;
  selectAnswer: (questionId: string, answer: number | string) => void;
  submitQuiz: () => void;
  resetQuiz: () => void;
  tickTimer: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
  
  activeQuizId: null,
  questions: [],
  userAnswers: {},
  isSubmitted: false,
  timeRemaining: 0,
  
  startQuiz: (quizId, questions, mode) => set({
    activeQuizId: quizId,
    questions,
    userAnswers: {},
    isSubmitted: false,
    timeRemaining: questions.length * 60, // 1 minute per question
  }),
  
  selectAnswer: (questionId, answer) => set((state) => ({
    userAnswers: {
      ...state.userAnswers,
      [questionId]: answer,
    }
  })),
  
  submitQuiz: () => set({ isSubmitted: true }),
  
  resetQuiz: () => set({
    activeQuizId: null,
    questions: [],
    userAnswers: {},
    isSubmitted: false,
    timeRemaining: 0,
  }),
  
  tickTimer: () => set((state) => ({
    timeRemaining: Math.max(state.timeRemaining - 1, 0)
  })),
}));
