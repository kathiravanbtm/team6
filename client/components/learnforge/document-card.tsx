"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  MoreVertical,
  BrainCircuit,
  Eye,
  Trash2,
  Clock, Layers,
  BookOpen,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";
import { ProgressBar } from "@/components/ui/progress";

export interface DocumentItem {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt" | "md";
  size: string;
  uploadedAt: string;
  status: "ready" | "processing" | "failed";
  topicsCount?: number;
  quizzesCount?: number;
  pageCount?: number;
  flashcardsCount?: number;
  lastStudied?: string;
  processingProgress?: number; // 0 to 100
  processingStep?: string; // e.g. "Extracting content..."
}

interface DocumentCardProps {
  document: DocumentItem;
  onGenerateQuiz?: (id: string) => void;
  onGenerateFlashcards?: (id: string) => void;
  onOpenDetails?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStudyFlashcards?: (id: string) => void;
}

export function DocumentCard({
  document: doc,
  onGenerateQuiz,
  onGenerateFlashcards,
  onOpenDetails,
  onDelete,
  onStudyFlashcards,
}: DocumentCardProps) {
  const isReady = doc.status === "ready";
  const isProcessing = doc.status === "processing";
  const isFailed = doc.status === "failed";

  const fileStyles = {
    pdf: "border-red-200 text-red-500 bg-red-50/60",
    docx: "border-blue-200 text-blue-500 bg-blue-50/60",
    txt: "border-gray-300 text-gray-500 bg-gray-50/60",
    md: "border-teal-200 text-teal-600 bg-teal-50/60",
  };

  const actions = [
    {
      id: "open",
      label: "Open Material",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onOpenDetails?.(doc.id),
    },
    ...(isReady
      ? [
          ...(onGenerateQuiz
            ? [
                {
                  id: "generate",
                  label: "Generate Quiz",
                  icon: <BrainCircuit className="h-4 w-4 text-primary" />,
                  onClick: () => onGenerateQuiz(doc.id),
                },
              ]
            : []),
          ...(onGenerateFlashcards
            ? [
                {
                  id: "generate-fc",
                  label: "Generate Flashcards",
                  icon: <Layers className="h-4 w-4 text-indigo-500" />,
                  onClick: () => onGenerateFlashcards(doc.id),
                },
              ]
            : []),
          ...(onStudyFlashcards
            ? [
                {
                  id: "flashcards",
                  label: "Study Flashcards",
                  icon: <Layers className="h-4 w-4 text-indigo-500" />,
                  onClick: () => onStudyFlashcards(doc.id),
                },
              ]
            : []),
        ]
      : []),
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      onClick: () => onDelete?.(doc.id),
    },
  ];

  return (
    <Card
      hoverLift
      className="flex flex-col justify-between font-sans border-border-color bg-surface p-5 rounded-xl shadow-xs min-h-[220px]"
    >
      {/* CARD HEADER */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-11 w-11 rounded-lg border flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
              fileStyles[doc.type] || "border-border-color bg-background"
            }`}
          >
            {doc.type}
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-text-primary text-sm leading-snug line-clamp-1 max-w-[170px]" title={doc.name}>
              {doc.name}
            </h4>
            <span className="text-[10px] text-text-secondary font-medium">
              {doc.type.toUpperCase()} &bull; {doc.pageCount ?? 1} {doc.pageCount === 1 ? "page" : "pages"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isFailed && <Badge variant="error">Failed</Badge>}
          <Dropdown
            trigger={
              <button className="p-1 hover:bg-background rounded-full border border-transparent hover:border-border-color transition-colors cursor-pointer text-text-secondary hover:text-text-primary focus:outline-none">
                <MoreVertical className="h-4.5 w-4.5" />
              </button>
            }
            items={actions}
          />
        </div>
      </div>

      {/* CARD BODY */}
      <div className="my-5 flex-1 flex flex-col justify-center">
        {isReady && (
          <div className="grid grid-cols-3 gap-2 text-center bg-background/50 border border-border-color/40 p-2.5 rounded-lg">
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-text-primary block">
                {doc.topicsCount ?? 0}
              </span>
              <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider block">
                Topics
              </span>
            </div>
            <div className="space-y-0.5 border-x border-border-color/40">
              <span className="text-xs font-extrabold text-text-primary block">
                {doc.quizzesCount ?? 0}
              </span>
              <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider block">
                Quizzes
              </span>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-extrabold text-text-primary block">
                {doc.flashcardsCount ?? 0}
              </span>
              <span className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider block">
                Cards
              </span>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary select-none">
              <span className="flex items-center gap-1.5 text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                {doc.processingStep || "Analyzing document..."}
              </span>
              <span>{doc.processingProgress ?? 10}%</span>
            </div>
            <ProgressBar value={doc.processingProgress ?? 10} />
          </div>
        )}

        {isFailed && (
          <p className="text-xs text-error font-medium leading-relaxed bg-error/5 border border-error/10 p-2.5 rounded-lg select-none">
            Error occurred while extracting topics from this file format. Please try again.
          </p>
        )}
      </div>

      {/* CARD FOOTER */}
      <div className="border-t border-border-color/50 pt-3.5 flex justify-between items-center text-[10px] font-semibold text-text-secondary">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {isReady ? `Last studied ${doc.lastStudied ?? "just now"}` : `Uploaded ${doc.uploadedAt}`}
        </span>

        {isReady && (onGenerateQuiz || onGenerateFlashcards) && (
          <div className="flex items-center gap-3 select-none">
            {onGenerateQuiz && (
              <button
                onClick={() => onGenerateQuiz(doc.id)}
                className="text-xs font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer focus:outline-none flex items-center gap-1"
              >
                <BrainCircuit className="h-4 w-4 shrink-0" />
                + Quiz
              </button>
            )}
            {onGenerateFlashcards && (
              <button
                onClick={() => onGenerateFlashcards(doc.id)}
                className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer focus:outline-none flex items-center gap-1"
              >
                <Layers className="h-4 w-4 shrink-0" />
                + Cards
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
