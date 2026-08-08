# LearnForge AI Technical Documentation

Welcome to the comprehensive technical documentation for **LearnForge AI**, an AI-powered Quiz Generator and Active Recall platform built with Express.js, Next.js 16, Supabase `pgvector`, and OpenRouter.

## Documentation Index

1. [Architecture Overview](ARCHITECTURE.md)
   - High-level system architecture diagram
   - RAG (Retrieval-Augmented Generation) workflow
   - Data flow & component interaction
2. [API Reference](API_DOCUMENTATION.md)
   - Express REST API endpoints specification
   - Request headers, query params, and JSON schemas
   - Error handling & rate limiting rules
3. [Database & Vector Search Schema](DATABASE_SCHEMA.md)
   - PostgreSQL table schemas & relationships
   - Supabase `pgvector` 1536-dimensional cosine distance indexing
   - Vector similarity search RPC function (`match_document_chunks`)
   - Row Level Security (RLS) policies
4. [Setup & Deployment Guide](SETUP_GUIDE.md)
   - Local development setup instructions
   - Environment variables reference (`server/.env`, `client/.env.local`)
   - Next.js production build (`npm run build`) and deployment guide

---

## Technical Stack Overview

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router) + React 19 | Server & Client Components UI |
| **Styling & UI** | Tailwind CSS, Lucide React, Framer Motion, Recharts | Premium aesthetic interface & analytics |
| **Backend Service** | Express.js / Node.js | REST API server, RAG orchestration, parsing |
| **Vector Database** | Supabase PostgreSQL + `pgvector` | Storing & retrieving 1536-dim vector embeddings |
| **Authentication** | Supabase Auth (`@supabase/supabase-js`) | JWT Bearer authentication with dev bypass |
| **LLM & Embeddings** | OpenRouter (`openrouter/free`, `text-embedding-3-small`) | Embeddings & structured Zod schema LLM generation |
