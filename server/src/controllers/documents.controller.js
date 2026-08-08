const { parseDocument } = require('../services/parser.service');
const { chunkText } = require('../services/chunker.service');
const { generateEmbeddings } = require('../services/embedding.service');
const { supabaseAdmin } = require('../config/supabase');

/**
 * POST /api/documents/upload
 * Process document upload (PDF file, Web URL, or Raw Text), chunk, embed, and store in database.
 */
async function uploadDocument(req, res, next) {
  const reqStart = Date.now();
  try {
    const file = req.file;
    const { url, text, title: userTitle } = req.body;

    if (!file && !url && !text) {
      return res.status(400).json({ error: 'Please provide a PDF, TXT, MD, or DOCX file, a web page URL, or text content.' });
    }

    // Step 1: Parse content
    const parseResult = await parseDocument({
      buffer: file?.buffer,
      filename: file?.originalname,
      url,
      text,
    });

    const docTitle = userTitle || parseResult.title;
    const rawText = parseResult.raw_text;

    if (!rawText || rawText.length < 20) {
      return res.status(400).json({ error: 'Extracted text is too short to process into study material.' });
    }

    // Step 2: Chunk text
    const chunks = chunkText(rawText);
    if (chunks.length === 0) {
      return res.status(400).json({ error: 'Failed to split document into readable chunks.' });
    }

    // Step 3: Generate vector embeddings for all chunks via OpenRouter
    const embedStart = Date.now();
    const chunkTexts = chunks.map(c => c.content);
    let embeddings = [];

    try {
      embeddings = await generateEmbeddings(chunkTexts);
    } catch (embedErr) {
      console.warn('[EMBEDDING WARN] Failed to generate embeddings via OpenRouter, continuing without vectors:', embedErr.message);
      embeddings = new Array(chunks.length).fill(null);
    }
    const embedTimeMs = Date.now() - embedStart;

    // Step 4: Database Storage in Supabase
    const userId = req.user?.id;

    // Insert Document header
    const { data: docData, error: docErr } = await supabaseAdmin
      .from('documents')
      .insert({
        user_id: userId,
        title: docTitle,
        source_type: parseResult.source_type,
        raw_text: rawText,
      })
      .select('id, user_id, title, source_type, created_at')
      .single();

    if (docErr) {
      throw new Error(`Failed to save document in database: ${docErr.message}`);
    }

    const documentId = docData.id;

    // Prepare Chunks for DB insert
    const chunkRecords = chunks.map((c, i) => ({
      document_id: documentId,
      chunk_index: c.chunk_index,
      content: c.content,
      embedding: embeddings[i] || null,
    }));

    const { data: savedChunks, error: chunksErr } = await supabaseAdmin
      .from('document_chunks')
      .insert(chunkRecords)
      .select('id, chunk_index');

    if (chunksErr) {
      throw new Error(`Failed to save document chunks in database: ${chunksErr.message}`);
    }

    const totalDurationMs = Date.now() - reqStart;

    console.log(`[PERF SUMMARY] Document Upload & Processing complete in ${totalDurationMs}ms (Parse: ${parseResult.parse_time_ms}ms, Embed: ${embedTimeMs}ms)`);

    return res.status(201).json({
      document_id: documentId,
      title: docData.title,
      source_type: docData.source_type,
      chunk_count: savedChunks.length,
      created_at: docData.created_at,
      performance: {
        total_time_ms: totalDurationMs,
        parse_time_ms: parseResult.parse_time_ms,
        embed_time_ms: embedTimeMs,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/documents
 * List all documents uploaded by the user with quiz counts.
 */
async function getDocuments(req, res, next) {
  try {
    const userId = req.user?.id;
    
    // Fetch documents
    const { data: docs, error: docErr } = await supabaseAdmin
      .from('documents')
      .select('id, user_id, title, source_type, created_at')
      .order('created_at', { ascending: false });

    if (docErr) {
      throw new Error(`Failed to fetch documents: ${docErr.message}`);
    }

    // For each document, count quizzes and chunks
    const docsWithCounts = await Promise.all((docs || []).map(async (doc) => {
      // Get count of quizzes
      const { count: quizCount } = await supabaseAdmin
        .from('quizzes')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', doc.id);

      // Get count of chunks to estimate topics (e.g. 1 topic per 2 chunks, min 1)
      const { count: chunkCount } = await supabaseAdmin
        .from('document_chunks')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', doc.id);

      return {
        id: doc.id,
        name: doc.title,
        type: doc.source_type,
        uploadedAt: doc.created_at,
        status: 'ready',
        topicsCount: Math.max(1, Math.ceil((chunkCount || 0) / 2)),
        quizzesCount: quizCount || 0,
      };
    }));

    return res.json(docsWithCounts);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/documents/:id
 * Deletes a document and all related cascaded chunks/quizzes.
 */
async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }

    return res.json({ message: 'Document deleted successfully', id });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument,
};
