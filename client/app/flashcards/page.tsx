"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFlashcardStore, FlashcardDeck } from "@/lib/services/flashcard";
import { Sidebar } from "@/components/learnforge/sidebar";
import { Topbar } from "@/components/learnforge/topbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { SearchInput } from "@/components/ui/search-input";
import { Dialog } from "@/components/ui/dialog";
import { toast, ToastContainer } from "@/components/ui/toast";
import { Plus, Layers, BookOpen, Clock, Calendar, Check, Search, Trash2 } from "lucide-react";

export default function FlashcardsLibraryPage() {
  const router = useRouter();
  
  // Zustand Store
  const decks = useFlashcardStore((state: any) => state.decks);
  const createDeck = useFlashcardStore((state: any) => state.createDeck);
  const setActiveDeck = useFlashcardStore((state: any) => state.setActiveDeck);

  // Filter states
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedFilter, setSelectedFilter] = React.useState<"All" | "Due" | "Weak" | "Mastered">("All");

  // Create modal states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newDeckName, setNewDeckName] = React.useState("");
  const [selectedMaterial, setSelectedMaterial] = React.useState("Operating Systems.pdf");

  const handleStudyDeck = (deckId: string) => {
    setActiveDeck(deckId);
    toast("Loading cards deck...", { type: "info" });
    setTimeout(() => {
      router.push(`/flashcards/${deckId}/study`);
    }, 800);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) {
      toast("Deck name is required", { type: "error" });
      return;
    }

    // Spawn 5 mock cards
    const cards = [
      {
        id: `fc-new-1-${Date.now()}`,
        front: "What is a system call?",
        back: "A system call is the programmatic way in which a computer program requests a service from the kernel of the operating system it is executed on.",
        topic: "Kernel Architecture",
      },
      {
        id: `fc-new-2-${Date.now()}`,
        front: "What is memory segmentation?",
        back: "Segmentation is a memory-management scheme that supports the user view of memory, splitting space into variable length segments (code, stack, heap).",
        topic: "Memory Management",
      },
    ];

    createDeck(newDeckName, cards);
    setIsCreateOpen(false);
    setNewDeckName("");
    toast(`Created "${newDeckName}" Deck`, {
      type: "success",
      description: "Added 2 auto-extracted study cards.",
    });
  };

  // Filter logic
  const filteredDecks = decks.filter((deck: any) => {
    const matchesSearch = deck.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (selectedFilter === "Due") matchesStatus = deck.dueToday > 0;
    if (selectedFilter === "Weak") matchesStatus = deck.mastery < 70;
    if (selectedFilter === "Mastered") matchesStatus = deck.mastery >= 70;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      <ToastContainer />
      <Sidebar />

      <div className="flex flex-col flex-1 md:pl-[240px]">
        <Topbar title="Flashcards" subtitle="Review concepts until they stick." />

        <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8 font-sans">
          
          {/* SEARCH & FILTERS HEADER CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border-color p-4 rounded-xl shadow-xs">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="Search flashcard decks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
                className="h-10"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
              {/* Horizontal filters */}
              <div className="flex items-center bg-background border border-border-color p-1 rounded-lg">
                {(["All", "Due", "Weak", "Mastered"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFilter(f)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      selectedFilter === f
                        ? "bg-surface text-text-primary shadow-xs font-bold"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {f === "Due" ? "Due Today" : f}
                  </button>
                ))}
              </div>

              {/* Create CTA trigger */}
              <Button
                variant="primary"
                onClick={() => setIsCreateOpen(true)}
                className="h-10 text-xs font-bold shadow-sm cursor-pointer"
              >
                <Plus className="h-4 w-4 shrink-0" />
                Create Deck
              </Button>
            </div>
          </div>

          {/* DECK GRID */}
          {filteredDecks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDecks.map((deck: any) => {
                const isWeak = deck.mastery < 70;
                return (
                  <Card
                    key={deck.id}
                    hoverLift
                    className="border border-border-color bg-surface p-5 rounded-xl flex flex-col justify-between min-h-[220px]"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4.5 w-4.5 text-primary shrink-0" />
                          <h4 className="font-bold text-text-primary text-sm line-clamp-1 truncate max-w-[150px]">
                            {deck.name}
                          </h4>
                        </div>
                        {deck.dueToday > 0 && (
                          <Badge variant="error" className="text-[9px] uppercase font-bold py-0.5 px-2">
                            {deck.dueToday} Due
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                        <span>{deck.size} cards</span>
                        <span className="h-1 w-1 rounded-full bg-border-color" />
                        <span>{deck.mastery}% mastered</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-3.5 border-t border-border-color/50 space-y-4">
                      {/* Mastery Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-semibold text-text-secondary select-none">
                          <span>Mastery rate</span>
                          <span>{deck.mastery}%</span>
                        </div>
                        <ProgressBar value={deck.mastery} className="h-1.5" />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-text-secondary font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {deck.lastReviewed}
                        </span>

                        <Button
                          variant="secondary"
                          onClick={() => handleStudyDeck(deck.id)}
                          className="h-8 py-0 px-4 text-[10px] font-semibold cursor-pointer shrink-0"
                        >
                          Study Deck
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-color rounded-xl bg-surface/50 font-sans min-h-[350px]">
              <div className="relative h-20 w-20 mb-6 flex items-center justify-center select-none">
                <div className="absolute inset-0 bg-primary/5 rounded-full blur-md animate-pulse" />
                <Layers className="h-10 w-10 text-primary z-10" />
                <Layers className="h-10 w-10 text-border-color absolute translate-x-2.5 translate-y-2" />
              </div>

              <h3 className="text-base font-bold text-text-primary mb-1.5">
                No flashcards yet
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mb-6 leading-relaxed">
                Generate or create custom recall flashcard decks directly from your study materials to reinforce active recall.
              </p>

              <Button
                variant="secondary"
                onClick={() => setIsCreateOpen(true)}
                className="px-6 h-9.5 text-xs font-semibold cursor-pointer"
              >
                <Plus className="h-4 w-4 shrink-0" />
                Create Deck
              </Button>
            </div>
          )}

        </main>
      </div>

      {/* CREATE DECK DIALOG MODAL */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Study Deck"
        description="Extract concepts and terms to test your memory."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary block">
              Deck Name
            </label>
            <input
              type="text"
              placeholder="e.g. Operating Systems Chapter 1"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              className="h-10 w-full px-3.5 rounded-lg border border-border-color bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-text-secondary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary block">
              Study Reference
            </label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="h-10 w-full px-3 rounded-lg border border-border-color bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Operating Systems.pdf">Operating Systems.pdf</option>
              <option value="Lecture 3 - Mitochondrial Genetics.pdf">Mitochondrial Genetics.pdf</option>
              <option value="Krebs Cycle pathways.docx">Krebs Cycle pathways.docx</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="h-9.5 text-xs font-semibold cursor-pointer border-border-color"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="h-9.5 text-xs font-semibold cursor-pointer"
            >
              Generate Deck
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
