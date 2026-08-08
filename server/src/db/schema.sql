-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('pdf', 'url', 'text')),
    raw_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DOCUMENT CHUNKS TABLE
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cosine similarity index on embeddings
-- Note: IVFFLAT requires existing rows to build optimal lists. HNSW can be used immediately.
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_ivfflat 
ON public.document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 3. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    source_chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE SET NULL,
    difficulty TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FLASHCARDS TABLE
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    source_chunk_id UUID REFERENCES public.document_chunks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    answers JSONB NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

---------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
---------------------------------------------------------
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;

-- Policies for Documents
CREATE POLICY "Users can manage their own documents"
ON public.documents FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for Document Chunks (inherited access via document ownership)
CREATE POLICY "Users can access chunks of their own documents"
ON public.document_chunks FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.documents d
        WHERE d.id = document_chunks.document_id AND d.user_id = auth.uid()
    )
);

-- Policies for Quizzes
CREATE POLICY "Users can manage their own quizzes"
ON public.quizzes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for Questions (inherited access via quiz ownership)
CREATE POLICY "Users can access questions of their own quizzes"
ON public.questions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.quizzes q
        WHERE q.id = questions.quiz_id AND q.user_id = auth.uid()
    )
);

-- Policies for Flashcards
CREATE POLICY "Users can manage their own flashcards"
ON public.flashcards FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policies for Attempts
CREATE POLICY "Users can manage their own quiz attempts"
ON public.attempts FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

---------------------------------------------------------
-- VECTOR SEARCH RPC FUNCTION
---------------------------------------------------------
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(1536),
    match_count INT DEFAULT 5,
    filter_doc_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    chunk_index INT,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.chunk_index,
        dc.content,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM public.document_chunks dc
    WHERE (filter_doc_id IS NULL OR dc.document_id = filter_doc_id)
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
