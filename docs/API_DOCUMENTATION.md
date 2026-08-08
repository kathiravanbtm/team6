# Express Backend REST API Documentation

Base URL: `http://localhost:5000/api` (or `http://localhost:5001/api`)

## Authentication Headers

All API endpoints accept an optional Bearer JWT token in the `Authorization` header:

```http
Authorization: Bearer <SUPABASE_USER_JWT_TOKEN>
```

- **Authenticated Mode**: Verifies the Supabase JWT token and scopes database operations to `req.user.id = user.id`.
- **Dev Bypass Mode**: If `ALLOW_ANON_DEV=true` in `server/.env`, unauthenticated requests automatically fall back to dev mock user `00000000-0000-0000-0000-000000000000`.

---

## 1. System Health Endpoints

### GET `/health`
- **Description**: Public health check endpoint.
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "service": "LearnForge AI Quiz Generator API",
    "timestamp": "2026-08-08T12:00:00.000Z",
    "env": "development"
  }
  ```

---

## 2. Document Endpoints

### POST `/api/documents/upload`
- **Description**: Uploads a PDF file or text content, chunks text, generates OpenRouter 1536-dim vector embeddings, and stores records in Supabase.
- **Content-Type**: `multipart/form-data` or `application/json`
- **Request Body (Multipart)**:
  - `file`: PDF file binary (max 10MB)
  - `title` *(optional)*: Document display title
- **Response `201 Created`**:
  ```json
  {
    "document_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "title": "Mitochondrial Genetics",
    "source_type": "pdf",
    "chunk_count": 12,
    "created_at": "2026-08-08T12:00:00.000Z",
    "performance": {
      "total_time_ms": 3200,
      "parse_time_ms": 250,
      "embed_time_ms": 2800
    }
  }
  ```

### GET `/api/documents`
- **Description**: Fetches all documents uploaded by the authenticated user.
- **Response `200 OK`**:
  ```json
  {
    "documents": [
      {
        "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "title": "Mitochondrial Genetics",
        "source_type": "pdf",
        "chunk_count": 12,
        "created_at": "2026-08-08T12:00:00.000Z"
      }
    ]
  }
  ```

### DELETE `/api/documents/:id`
- **Description**: Deletes a document and its cascade chunks/quizzes.
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Document deleted successfully"
  }
  ```

---

## 3. Quiz Endpoints

### POST `/api/quiz/generate`
- **Description**: Generates an AI practice quiz from document chunks using vector search RAG and OpenRouter LLM.
- **Request Body**:
  ```json
  {
    "document_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "num_questions": 5,
    "difficulty": "medium",
    "topic_query": "maternal inheritance"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "quiz_id": "11111111-2222-3333-4444-555555555555",
    "title": "Mitochondrial Genetics Quiz",
    "created_at": "2026-08-08T12:00:00.000Z",
    "questions": [
      {
        "id": "q-1",
        "question_text": "Why is mitochondrial DNA maternally inherited?",
        "options": [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        "correct_answer": "Option B",
        "explanation": "Detailed pedagogical explanation citing source text.",
        "difficulty": "medium",
        "source_chunk_id": "chunk-uuid"
      }
    ]
  }
  ```

### GET `/api/quiz/:id`
- **Description**: Retrieves a specific quiz and all its questions.

### POST `/api/quiz/:id/submit`
- **Description**: Submits quiz answers for server-side evaluation and logs an attempt in `attempts` table.
- **Request Body**:
  ```json
  {
    "answers": [
      { "question_id": "q-1", "selected": "Option B" }
    ]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "attempt_id": "att-uuid",
    "score": 100,
    "correct_count": 1,
    "total_questions": 1,
    "results": [
      {
        "question_id": "q-1",
        "is_correct": true,
        "explanation": "Detailed explanation."
      }
    ]
  }
  ```

### GET `/api/quiz/attempts/history`
- **Description**: Fetches historical quiz attempt scores and accuracy metrics for user analytics.

---

## 4. Flashcard Endpoints

### POST `/api/flashcards/generate`
- **Description**: Generates active recall front/back flashcard decks with explanations.
- **Request Body**:
  ```json
  {
    "document_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "num_cards": 5
  }
  ```

### GET `/api/flashcards/:document_id`
- **Description**: Retrieves saved flashcards for a document.
