"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:5000/api";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { DocumentCard, DocumentItem } from "@/components/learnforge/document-card";
import { Flashcard, FlashcardItem } from "@/components/learnforge/flashcard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Dialog } from "@/components/ui/dialog";
import { UploadDropzone } from "@/components/learnforge/upload-dropzone";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state-indicators";
import { toast, ToastContainer } from "@/components/ui/toast";
import { Plus, Filter, FileCode2, Search, FileText } from "lucide-react";

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = React.useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<"All" | "PDF" | "DOCX" | "TXT" | "Markdown">("All");
  
  // Interface triggers
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [generatingFlashcardsDocId, setGeneratingFlashcardsDocId] = React.useState<string | null>(null);

  // Flashcards Modal triggers
  const [activeDeck, setActiveDeck] = React.useState<{
    title: string;
    flashcards: FlashcardItem[];
  } | null>(null);
  const [currentFcIndex, setCurrentFcIndex] = React.useState(0);

  // Fetch Documents List from server RAG DB
  const fetchDocuments = React.useCallback(async () => {
    try {
      setIsInitialLoading(true);
      const res = await fetch(`${API_BASE}/documents`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
    } catch (err: any) {
      console.error("Error fetching documents:", err.message);
      setHasError(true);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadFile = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];

    // Close Dialog Modal
    setIsUploadOpen(false);

    // Create a new document in processing state locally
    const tempDocId = `temp-${Date.now()}`;
    const newDoc: DocumentItem = {
      id: tempDocId,
      name: file.name,
      type: (file.name.split(".").pop()?.toLowerCase() as any) || "pdf",
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: "Just now",
      status: "processing",
      processingProgress: 20,
      processingStep: "Uploading content...",
    };

    setDocuments((prev) => [newDoc, ...prev]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to upload document");
      }

      const uploadData = await res.json();
      
      // Update local state item to ready with actual DB id
      setDocuments((prev: DocumentItem[]) =>
        prev.map((d: DocumentItem) =>
          d.id === tempDocId
            ? {
                ...d,
                id: uploadData.document_id,
                status: "ready",
                topicsCount: uploadData.chunk_count ? Math.max(1, Math.ceil(uploadData.chunk_count / 2)) : 5,
                quizzesCount: 0,
                flashcardsCount: 0,
                pageCount: uploadData.chunk_count ? Math.max(1, Math.ceil(uploadData.chunk_count / 3)) : 10,
                lastStudied: "never studied",
              }
            : d
        )
      );

      toast("Processing complete!", {
        type: "success",
        description: `"${file.name}" is now ready for practice.`,
      });

    } catch (err: any) {
      toast("Failed to process document", {
        type: "error",
        description: err.message,
      });
      // Remove temp doc on error
      setDocuments((prev: DocumentItem[]) => prev.filter((d: DocumentItem) => d.id !== tempDocId));
    }
  };

  const handleDeleteDocument = async (id: string) => {
    const docToDelete = documents.find((d: DocumentItem) => d.id === id);
    if (!docToDelete) return;

    try {
      const res = await fetch(`${API_BASE}/documents/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete document");

      setDocuments((prev: DocumentItem[]) => prev.filter((d: DocumentItem) => d.id !== id));
      toast(`Deleted ${docToDelete.name}`, {
        type: "info",
        description: "Material deleted from study database.",
      });
    } catch (err: any) {
      toast("Error deleting document", {
        type: "error",
        description: err.message,
      });
    }
  };

  const handleGenerateFlashcards = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    setGeneratingFlashcardsDocId(id);
    toast(`Generating AI flashcards for "${doc.name}"...`, {
      type: "info",
      description: "Extracting concepts via OpenRouter LLM.",
    });

    try {
      const res = await fetch(`${API_BASE}/flashcards/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: id,
          count: 8,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate flashcards.");
      }

      const data = await res.json();
      
      // Update local state card counts
      setDocuments((prev: DocumentItem[]) =>
        prev.map((d: DocumentItem) =>
          d.id === id
            ? { ...d, flashcardsCount: (d.flashcardsCount || 0) + (data.flashcards?.length || 8) }
            : d
        )
      );

      toast("Flashcards generated successfully!", {
        type: "success",
        description: `Created ${data.flashcards?.length || 8} new spaced repetition cards.`,
      });

      // Display the generated flashcards directly in-place!
      if (data.flashcards && data.flashcards.length > 0) {
        setActiveDeck({
          title: doc.name,
          flashcards: data.flashcards,
        });
        setCurrentFcIndex(0);
      }
    } catch (err: any) {
      console.error("Flashcards generation error:", err.message);
      toast("Failed to generate flashcards", {
        type: "error",
        description: err.message,
      });
    } finally {
      setGeneratingFlashcardsDocId(null);
    }
  };

  const handleStudyFlashcards = async (id: string) => {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;

    toast("Loading your flashcards...", { type: "info" });
    try {
      const res = await fetch(`${API_BASE}/flashcards/${id}`);
      if (!res.ok) throw new Error("Failed to retrieve flashcards");
      const data = await res.json();
      
      if (data.flashcards && data.flashcards.length > 0) {
        setActiveDeck({
          title: doc.name,
          flashcards: data.flashcards,
        });
        setCurrentFcIndex(0);
      } else {
        toast(`No flashcards found for "${doc.name}"`, {
          type: "warning",
          description: "Click + Cards to generate them via AI first.",
        });
      }
    } catch (err: any) {
      toast("Error loading flashcards", {
        type: "error",
        description: err.message,
      });
    }
  };

  const handleGenerateQuiz = (id: string) => {
    router.push(`/quizzes/create?materialId=${id}`);
  };

  const handleOpenDetails = (id: string) => {
    router.push(`/documents/${id}`);
  };

  // Filtered logic
  const filteredDocuments = documents.filter((doc: DocumentItem) => {
    // Search query check
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter check
    let matchesType = true;
    if (selectedFilter === "PDF") matchesType = doc.type === "pdf";
    if (selectedFilter === "DOCX") matchesType = doc.type === "docx";
    if (selectedFilter === "TXT") matchesType = doc.type === "txt";
    if (selectedFilter === "Markdown") matchesType = doc.type === "md";

    return matchesSearch && matchesType;
  });

  // Filter keys helper
  const filters: ("All" | "PDF" | "DOCX" | "TXT" | "Markdown")[] = ["All", "PDF", "DOCX", "TXT", "Markdown"];

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />

      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Panel Frame */}
      <div className="flex flex-col flex-1 md:pl-[240px]">
        {/* HEADER */}
        <Topbar
          title="Study Materials"
          subtitle="Everything you're learning from, in one place."
        />

        {/* CONTENT */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8 font-sans">
          
          {/* SEARCH & FILTER CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border-color p-4 rounded-xl shadow-xs">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Search by filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
                className="h-10"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
              {/* Type Switcher */}
              <div className="flex items-center bg-background border border-border-color p-1 rounded-lg">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(f)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      selectedFilter === f
                        ? "bg-surface text-text-primary shadow-xs font-bold"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Upload trigger */}
              <Button
                variant="primary"
                onClick={() => setIsUploadOpen(true)}
                className="h-10 text-xs font-bold shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4 shrink-0" />
                Upload Material
              </Button>
            </div>
          </div>

          {/* ERROR STATE TEST TOGGLE */}
          {hasError ? (
            <ErrorState
              title="Failed to fetch study materials"
              description="A network latency occurred while syncing files from the database. Please try again."
              onRetry={() => setHasError(false)}
            />
          ) : (
            <>
              {/* SKELETON LOADER GRID */}
              {isInitialLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="border border-border-color bg-surface p-5 rounded-xl min-h-[220px] flex flex-col justify-between select-none">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 rounded-lg" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4.5 w-3/4" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-full my-4" />
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* DOCUMENT GRID */}
                  {filteredDocuments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredDocuments.map((doc) => {
                        const isSelfGenerating = generatingFlashcardsDocId === doc.id;
                        const displayDoc: DocumentItem = isSelfGenerating
                          ? {
                              ...doc,
                              status: "processing",
                              processingProgress: 60,
                              processingStep: "Creating flashcards...",
                            }
                          : doc;
                        return (
                          <DocumentCard
                            key={doc.id}
                            document={displayDoc}
                            onDelete={handleDeleteDocument}
                            onGenerateQuiz={handleGenerateQuiz}
                            onGenerateFlashcards={handleGenerateFlashcards}
                            onOpenDetails={handleOpenDetails}
                            onStudyFlashcards={handleStudyFlashcards}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    /* EMPTY STATE (Illustration made entirely from UI/CSS) */
                    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-color rounded-xl bg-surface/50 font-sans min-h-[350px]">
                      {/* CSS/UI Abstract File Illustration */}
                      <div className="relative h-20 w-20 mb-6 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/5 rounded-full blur-md animate-pulse" />
                        {/* CSS Stacked Files */}
                        <div className="absolute h-14 w-10 border-2 border-dashed border-border-color bg-surface rounded-md rotate-6 translate-x-2 translate-y-1 shadow-xs" />
                        <div className="absolute h-14 w-10 border border-border-color bg-surface rounded-md flex flex-col justify-between p-2 shadow-sm z-10">
                          <div className="space-y-1">
                            <div className="h-1 w-6 bg-primary/30 rounded" />
                            <div className="h-1 w-4 bg-border-color rounded" />
                            <div className="h-1 w-5 bg-border-color rounded" />
                          </div>
                          <FileCode2 className="h-4 w-4 text-primary self-end" />
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-text-primary mb-1.5">
                        {searchQuery ? "No matching documents" : "No study material yet"}
                      </h3>
                      <p className="text-xs text-text-secondary max-w-sm mb-6 leading-relaxed">
                        {searchQuery
                          ? "We couldn't find any files matching your search query. Try typing another name."
                          : "Upload your first document and we'll turn it into an interactive learning experience."}
                      </p>
                      
                      {!searchQuery && (
                        <Button
                          variant="secondary"
                          onClick={() => setIsUploadOpen(true)}
                          className="px-6 h-9.5 text-xs font-semibold cursor-pointer"
                        >
                          <Plus className="h-4 w-4 shrink-0" />
                          Upload Material
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* DEVELOPMENT CONTROLS HELPER (Optional test trigger for errors) */}
          <div className="pt-8 border-t border-border-color/40 flex justify-end text-[10px] text-text-secondary select-none font-bold">
            <button
              onClick={() => setHasError(!hasError)}
              className="hover:underline cursor-pointer focus:outline-none"
            >
              Toggle Error State Test
            </button>
          </div>
        </main>
      </div>

      {/* UPLOAD MATERIAL MODAL / DIALOG */}
      <Dialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Study Material"
        description="Add a PDF, DOCX, TXT, or Markdown file to generate practice quizzes."
      >
        <div className="py-4">
          <UploadDropzone onUpload={handleUploadFile} />
        </div>
      </Dialog>

      {/* FLASHCARD VIEWER MODAL */}
      <Dialog
        isOpen={!!activeDeck}
        onClose={() => setActiveDeck(null)}
        title={`Study Deck: ${activeDeck?.title}`}
        description="Review flashcards to lock in core concept understanding."
      >
        {activeDeck && activeDeck.flashcards.length > 0 && (
          <div className="space-y-6 py-4">
            <Flashcard
              card={activeDeck.flashcards[currentFcIndex]}
              onScore={(cardId, gotIt) => {
                if (gotIt) {
                  toast("Marked as understood", { type: "success" });
                } else {
                  toast("Rescheduled for review", { type: "info" });
                }
                setTimeout(() => {
                  setCurrentFcIndex((prev) => (prev + 1) % activeDeck.flashcards.length);
                }, 1000);
              }}
            />

            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-text-secondary select-none">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentFcIndex((prev) => (prev - 1 + activeDeck.flashcards.length) % activeDeck.flashcards.length)
                }
                className="h-8 px-3 cursor-pointer"
              >
                Previous
              </Button>
              <span>
                {currentFcIndex + 1} of {activeDeck.flashcards.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentFcIndex((prev) => (prev + 1) % activeDeck.flashcards.length)}
                className="h-8 px-3 cursor-pointer"
              >
                Next
              </Button>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-border-color/30 max-w-sm mx-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const { exportFlashcardsToPdf } = await import("@/lib/utils/pdf-generator");
                  exportFlashcardsToPdf(activeDeck.title, activeDeck.flashcards, false);
                }}
                className="h-8 text-[10px] font-bold border-dashed border-border-color hover:bg-background cursor-pointer"
              >
                📄 Export Cards (No Answers)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const { exportFlashcardsToPdf } = await import("@/lib/utils/pdf-generator");
                  exportFlashcardsToPdf(activeDeck.title, activeDeck.flashcards, true);
                }}
                className="h-8 text-[10px] font-bold border-dashed border-border-color hover:bg-background cursor-pointer"
              >
                📄 Export Cards (With Answers)
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
