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
      return res.status(400).json({ error: 'Please provide a PDF file, a web page URL, or text content.' });
    }

    // Step 1: Parse content
    const parseResult = await parseDocument({
      buffer: file?.buffer,
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
      // Fallback: null embeddings if API key invalid or rate limited during dev setup
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

module.exports = {
  uploadDocument,
};
