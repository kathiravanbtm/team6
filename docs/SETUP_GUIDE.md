# Setup & Deployment Guide

## Prerequisites

- **Node.js**: v18.x or v20.x or v22.x
- **npm**: v9.x or higher
- **Supabase Account**: PostgreSQL database with `pgvector` extension
- **OpenRouter Account**: API Key (Free tier supported via `openrouter/free`)

---

## 1. Environment Configuration

### Backend (`server/.env`)
Create or edit `server/.env`:

```env
PORT=5000
NODE_ENV=development

# Supabase Credentials
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenRouter Credentials & Free Tier Model
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
OPENROUTER_LLM_MODEL=openrouter/free

# Dev Bypass Mode
ALLOW_ANON_DEV=true
```

### Frontend (`client/.env.local`)
Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 2. Database Schema Initialization

1. Open your Supabase Dashboard -> **SQL Editor**.
2. Copy and execute [server/src/db/schema.sql](file:///home/baymax/Documents/prodapt/team6/server/src/db/schema.sql).
3. Verify that tables (`documents`, `document_chunks`, `quizzes`, `questions`, `flashcards`, `attempts`) and the RPC function `match_document_chunks` are created.

---

## 3. Running in Development Mode

### Terminal 1: Express Backend
```bash
cd server
npm install
npm run dev
# Starts backend at http://localhost:5000 with auto-reload (node --watch)
```

### Terminal 2: Next.js Frontend
```bash
cd client
npm install
npm run dev
# Starts Next.js app at http://localhost:3000
```

---

## 4. Production Build & Deployment

### Building Frontend Bundle
```bash
cd client
npm run build
# Compiles static and server pages in 2-3 seconds
npm start
# Launches optimized production server at http://localhost:3000
```

### Deploying Frontend (Vercel)
1. Push project to GitHub.
2. Import repository in Vercel.
3. Set environment variables: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy!

### Deploying Backend (Render / Railway / Render)
1. Set root directory to `server`.
2. Build command: `npm install`.
3. Start command: `npm start`.
4. Configure environment variables in dashboard settings.
