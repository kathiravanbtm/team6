"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, MoreVertical, BrainCircuit, Eye, Trash2, Clock } from "lucide-react";
import { Dropdown } from "@/components/ui/dropdown";

export interface DocumentItem {
  id: string;
  name: string;
  type: "pdf" | "docx" | "txt" | "md";
  size: string;
  uploadedAt: string;
  status: "ready" | "processing" | "failed";
  topicsCount?: number;
  quizzesCount?: number;
}

interface DocumentCardProps {
  document: DocumentItem;
  onGenerateQuiz?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function DocumentCard({
  document: doc,
  onGenerateQuiz,
  onViewDetails,
  onDelete,
}: DocumentCardProps) {
  const fileIcon = {
    pdf: "border-red-200 text-red-500 bg-red-50",
    docx: "border-blue-200 text-blue-500 bg-blue-50",
    txt: "border-gray-200 text-gray-500 bg-gray-50",
    md: "border-teal-200 text-teal-600 bg-teal-50",
  };

  const statusConfig = {
    ready: { variant: "success" as const, label: "Ready" },
    processing: { variant: "warning" as const, label: "Processing..." },
    failed: { variant: "error" as const, label: "Failed" },
  };

  const actions = [
    {
      id: "view",
      label: "View material",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onViewDetails?.(doc.id),
    },
    ...(doc.status === "ready"
      ? [
          {
            id: "generate",
            label: "Generate AI Quiz",
            icon: <BrainCircuit className="h-4 w-4 text-primary" />,
            onClick: () => onGenerateQuiz?.(doc.id),
          },
        ]
      : []),
    {
      id: "delete",
      label: "Delete file",
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      onClick: () => onDelete?.(doc.id),
    },
  ];

  return (
    <Card hoverLift className="flex flex-col justify-between font-sans border-border-color/80 relative">
      <div>
        <div className="flex items-start justify-between">
          <div
            className={`h-11 w-11 rounded-lg border flex items-center justify-center font-bold text-xs uppercase ${
              fileIcon[doc.type] || "border-border-color text-text-secondary bg-background"
            }`}
          >
            {doc.type}
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={statusConfig[doc.status].variant}>
              {statusConfig[doc.status].label}
            </Badge>
            <Dropdown
              trigger={
                <button className="p-1 hover:bg-background rounded-full border border-transparent hover:border-border-color transition-colors cursor-pointer text-text-secondary hover:text-text-primary">
                  <MoreVertical className="h-4.5 w-4.5" />
                </button>
              }
              items={actions}
            />
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-text-primary text-base line-clamp-1 leading-snug">
            {doc.name}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-text-secondary">
            <span>{doc.size}</span>
            <span className="h-1 w-1 rounded-full bg-border-color" />
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {doc.uploadedAt}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-3.5 border-t border-border-color/40 flex justify-between items-center text-xs">
        <div className="flex items-center gap-4 text-text-secondary">
          <div>
            <span className="font-semibold text-text-primary block text-sm">
              {doc.topicsCount ?? 0}
            </span>
            <span>Topics</span>
          </div>
          <div className="w-[1px] h-6 bg-border-color/60" />
          <div>
            <span className="font-semibold text-text-primary block text-sm">
              {doc.quizzesCount ?? 0}
            </span>
            <span>Quizzes</span>
          </div>
        </div>

        {doc.status === "ready" && onGenerateQuiz && (
          <button
            onClick={() => onGenerateQuiz(doc.id)}
            className="flex items-center gap-1 font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
          >
            <BrainCircuit className="h-4 w-4" />
            Generate
          </button>
        )}
      </div>
    </Card>
  );
}
