const { retrieveDocumentChunks } = require('../services/retrieval.service');
const { generateFlashcards } = require('../services/generation.service');
const { supabaseAdmin } = require('../config/supabase');

/**
 * POST /api/flashcards/generate
 * Generates flashcards for a document.
 */
async function generateFlashcardsController(req, res, next) {
  const reqStart = Date.now();
  try {
    const { document_id, count = 5 } = req.body;

    if (!document_id) {
      return res.status(400).json({ error: 'document_id is required' });
    }

    const userId = req.user?.id;

    // 1. Retrieve Chunks
    const { chunks } = await retrieveDocumentChunks(document_id, {
      topK: Math.min(Math.max(Number(count) * 2, 5), 10),
    });

    // 2. Generate Flashcards via OpenRouter LLM
    const generatedCards = await generateFlashcards(chunks, { count: Number(count) });

    // 3. Save Flashcards in DB
    const flashcardRecords = generatedCards.map(c => ({
      document_id,
      user_id: userId,
      front: c.front,
      back: c.back,
      source_chunk_id: c.source_chunk_id,
    }));

    const { data: savedCards, error: dbErr } = await supabaseAdmin
      .from('flashcards')
      .insert(flashcardRecords)
      .select('*');

    if (dbErr) {
      throw new Error(`Failed to save flashcards: ${dbErr.message}`);
    }

    const totalDurationMs = Date.now() - reqStart;
    console.log(`[PERF SUMMARY] Flashcard generation complete in ${totalDurationMs}ms (${savedCards.length} cards)`);

    return res.status(201).json({
      document_id,
      count: savedCards.length,
      flashcards: savedCards,
      performance: {
        total_time_ms: totalDurationMs,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/flashcards/:document_id
 * Fetches existing flashcards for a document.
 */
async function getFlashcardsByDocumentId(req, res, next) {
  try {
    const { document_id } = req.params;

    const { data: flashcards, error: dbErr } = await supabaseAdmin
      .from('flashcards')
      .select('*')
      .eq('document_id', document_id)
      .order('created_at', { ascending: true });

    if (dbErr) {
      throw new Error(`Failed to fetch flashcards: ${dbErr.message}`);
    }

    return res.json({
      document_id,
      count: flashcards ? flashcards.length : 0,
      flashcards: flashcards || [],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateFlashcardsController,
  getFlashcardsByDocumentId,
};
