# System Architecture & RAG Pipeline

## System Architecture Diagram

```mermaid
graph TD
    Client[Next.js 16 Frontend Client] -->|HTTP / REST API| Server[Express.js Backend API]
    Client -->|Auth Session| SupabaseAuth[Supabase Auth Engine]
    
    subgraph Express Backend
        AuthMiddleware[Auth Middleware] --> DocController[Documents Controller]
        AuthMiddleware --> QuizController[Quiz Controller]
        
        DocController --> Parser[Parser Service PDF / Text]
        DocController --> Chunker[Chunker Service ~600 tokens]
        
        DocController --> EmbedService[Embedding Service OpenRouter]
        QuizController --> RetrievalService[RAG Retrieval Service]
        QuizController --> GenService[LLM Generation Service Zod Retry]
    end
    
    EmbedService -->|Generate 1536-dim Vectors| OpenRouterEmbed[OpenRouter Embeddings API]
    GenService -->|Generate Quizzes & Cards| OpenRouterLLM[OpenRouter LLM openrouter/free]
    
    RetrievalService -->|Cosine Similarity RPC| SupabaseDB[(Supabase Postgres + pgvector)]
    DocController -->|Store Chunks & Embeddings| SupabaseDB
```

---

## Retrieval-Augmented Generation (RAG) Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Next.js Client
    participant Express as Express Backend
    participant OpenRouter as OpenRouter API
    participant DB as Supabase pgvector

    User->>Frontend: Upload PDF / Notes
    Frontend->>Express: POST /api/documents/upload
    Express->>Express: Extract text & Split into chunks
    Express->>OpenRouter: POST /v1/embeddings (batch)
    OpenRouter-->>Express: Return 1536-dim float arrays
    Express->>DB: INSERT into documents & document_chunks
    Express-->>Frontend: HTTP 201 Document Processed

    User->>Frontend: Click "Generate Quiz"
    Frontend->>Express: POST /api/quiz/generate
    Express->>OpenRouter: Embed query / topic filter
    OpenRouter-->>Express: Query embedding vector
    Express->>DB: SELECT match_document_chunks(query_vector)
    DB-->>Express: Top K relevant chunks with text & IDs
    
    par Parallel LLM Generation
        Express->>OpenRouter: POST /v1/chat/completions (Quiz Prompt)
        Express->>OpenRouter: POST /v1/chat/completions (Flashcards Prompt)
    end
    
    OpenRouter-->>Express: JSON Quiz & Flashcards Response
    Express->>DB: INSERT into quizzes, questions & flashcards
    Express-->>Frontend: HTTP 201 Quiz JSON with Explanations
    Frontend-->>User: Display Interactive Quiz Player & Flashcards
```

---

## Service Layer Responsibilities

1. **Parser Service (`server/src/services/parser.service.js`)**:
   - Parses binary PDF buffers via `pdf-parse` or processes plain text inputs.
   - Cleans whitespace and normalizes text encoding.

2. **Chunker Service (`server/src/services/chunker.service.js`)**:
   - Splits document text into overlapping semantic chunks (~600 tokens target, ~100 token overlap).
   - Assigns sequential `chunk_index` numbers.

3. **Embedding Service (`server/src/services/embedding.service.js`)**:
   - Sends text chunks to OpenRouter embeddings endpoint (`openai/text-embedding-3-small`).
   - Uses IPv4 DNS socket binding (`family: 4`) to prevent network timeouts.

4. **Retrieval Service (`server/src/services/retrieval.service.js`)**:
   - Invokes Supabase Postgres RPC function `match_document_chunks`.
   - Computes cosine distance similarity (`1 - (dc.embedding <=> query_embedding)`).
   - Includes automatic full-text fallback if vector embeddings are absent.

5. **Generation Service (`server/src/services/generation.service.js`)**:
   - Constructs strict prompt templates referencing source chunk UUIDs.
   - Mandates detailed educational explanations for all generated questions.
   - Enforces Zod JSON output schema validation (`QuizOutputSchema` & `FlashcardsOutputSchema`) with automatic 1-step retry logic on malformed JSON.
