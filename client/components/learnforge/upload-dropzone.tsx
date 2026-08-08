"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onUpload: (files: File[]) => void;
  maxSizeMB?: number;
  className?: string;
}

export function UploadDropzone({
  onUpload,
  maxSizeMB = 10,
  className,
}: UploadDropzoneProps) {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setErrorMessage(null);

      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === "file-too-large") {
          setErrorMessage(`File is too large. Max size is ${maxSizeMB}MB.`);
        } else if (error.code === "file-invalid-type") {
          setErrorMessage("Invalid file type. Please upload PDF, DOCX, TXT, or MD.");
        } else {
          setErrorMessage("Failed to read file. Try another one.");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles);
      }
    },
    [onUpload, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className={cn("w-full max-w-xl mx-auto font-sans", className)}>
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.002, borderColor: "var(--color-primary)" }}
        className={cn(
          "border border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-200 bg-surface/50 border-border-color",
          isDragActive && "border-primary bg-primary/5",
          errorMessage && "border-error bg-error/5"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center">
          <div
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center mb-4 transition-colors",
              isDragActive
                ? "bg-primary/10 text-primary"
                : errorMessage
                ? "bg-error/10 text-error"
                : "bg-background text-text-secondary"
            )}
          >
            <UploadCloud className="h-6 w-6" />
          </div>

          <h3 className="text-base font-semibold text-text-primary mb-1">
            {isDragActive ? "Drop your file here" : "Upload your study material"}
          </h3>
          <p className="text-sm text-text-secondary max-w-sm mb-4">
            Drag and drop your PDF, DOCX, TXT, or Markdown files here, or click to
            browse
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-text-secondary">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              PDF, DOCX, TXT, MD
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-border-color" />
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Gen Ready
            </span>
          </div>
        </div>
      </motion.div>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 text-xs font-semibold text-error bg-error/5 border border-error/20 p-2.5 rounded-lg"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}
    </div>
  );
}
