"use client";

import { create } from "zustand";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  difficulty?: string;
  lastStudied?: string;
  box?: number; // Spaced repetition box index (1 to 5)
  nextReviewDate?: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  size: number;
  mastery: number;
  dueToday: number;
  lastReviewed: string;
  cards: Flashcard[];
}

export interface FlashcardState {
  decks: FlashcardDeck[];
  activeDeckId: string | null;
  
  // Actions
  setActiveDeck: (id: string | null) => void;
  rateCard: (deckId: string, cardId: string, rating: "again" | "hard" | "good" | "easy") => void;
  createDeck: (name: string, cards: Flashcard[]) => void;
}

const mockDecks: FlashcardDeck[] = [
  {
    id: "deck-1",
    name: "Operating Systems",
    size: 84,
    mastery: 62,
    dueToday: 12,
    lastReviewed: "2 hours ago",
    cards: [
      {
        id: "fc-1",
        front: "What is maternal inheritance in mitochondrial genetics?",
        back: "Mitochondria are inherited exclusively from the mother because the sperm's mitochondria are generally destroyed after fertilization.",
        topic: "Genetics",
        box: 2,
      },
      {
        id: "fc-2",
        front: "What is heteroplasmy?",
        back: "Heteroplasmy refers to the presence of more than one type of organellar genome (mitochondrial DNA) within a single cell.",
        topic: "Genetics",
        box: 1,
      },
      {
        id: "fc-3",
        front: "What is the function of Cytochrome c in cellular pathways?",
        back: "Cytochrome c is a small protein localized in the inner mitochondrial membrane. It transfers electrons between Complexes III and IV.",
        topic: "Biochemistry",
        box: 4,
      },
    ],
  },
  {
    id: "deck-2",
    name: "Mitochondrial Genetics",
    size: 24,
    mastery: 80,
    dueToday: 0,
    lastReviewed: "Yesterday",
    cards: [],
  },
];

export const useFlashcardStore = create<FlashcardState>((set) => ({
  decks: mockDecks,
  activeDeckId: null,
  
  setActiveDeck: (id) => set({ activeDeckId: id }),
  
  rateCard: (deckId, cardId, rating) => set((state) => {
    // Spaced repetition score adjustments
    const scoreMap = { again: 1, hard: 2, good: 3, easy: 4 };
    const ratingScore = scoreMap[rating];
    
    return {
      decks: state.decks.map((deck) => {
        if (deck.id !== deckId) return deck;
        return {
          ...deck,
          dueToday: Math.max(deck.dueToday - 1, 0),
          mastery: Math.min(deck.mastery + (ratingScore === 4 ? 2 : 1), 100),
          lastReviewed: "Just now",
        };
      }),
    };
  }),
  
  createDeck: (name, cards) => set((state) => ({
    decks: [
      ...state.decks,
      {
        id: `deck-${Date.now()}`,
        name,
        size: cards.length,
        mastery: 0,
        dueToday: cards.length,
        lastReviewed: "Never",
        cards,
      },
    ],
  })),
}));
