const { supabaseAdmin } = require('../config/supabase');
const { generateEmbeddings } = require('./embedding.service');

/**
 * Retrieves relevant chunks for a document.
 * Performs top-k vector search if a query topic is specified or if document has > 10 chunks.
 * Falls back to full-context chunk fetch if document is small.
 * 
 * @param {string} documentId - Supabase UUID for document
 * @param {Object} options
 * @param {string} [options.topicQuery] - Optional topic query for similarity search
 * @param {number} [options.topK=5] - Number of top chunks to retrieve when RAG is used
 * @returns {Promise<{ chunks: Array<{ id: string, chunk_index: number, content: string }>, rag_used: boolean, strategy_explanation: string }>}
 */
async function retrieveDocumentChunks(documentId, options = {}) {
  const { topicQuery, topK = 6 } = options;

  // 1. Fetch total chunk count for document
  const { data: allChunks, error: countErr } = await supabaseAdmin
    .from('document_chunks')
    .select('id, chunk_index, content')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true });

  if (countErr) {
    throw new Error(`Failed to fetch document chunks: ${countErr.message}`);
  }

  if (!allChunks || allChunks.length === 0) {
    throw new Error(`No document chunks found for document_id: ${documentId}`);
  }

  // Decision logic: RAG vs Full Context
  const isSmallDoc = allChunks.length <= 8;
  const useRag = Boolean(topicQuery || !isSmallDoc);

  if (!useRag) {
    console.log(`[RETRIEVAL] Small document (${allChunks.length} chunks) - Using FULL-CONTEXT mode (skipping retrieval theater).`);
    return {
      chunks: allChunks,
      rag_used: false,
      strategy_explanation: `Small document (${allChunks.length} chunks). Full context loaded directly without vector search.`,
    };
  }

  console.log(`[RETRIEVAL] Large document or topic query active - Performing RAG vector search.`);

  try {
    // Generate query vector (either from topic query or summary prompt)
    const queryText = topicQuery || 'Key concepts, main topics, facts, and quiz questions from this document';
    const [queryEmbedding] = await generateEmbeddings([queryText]);

    // Call Supabase RPC match_document_chunks
    const { data: matchedChunks, error: rpcErr } = await supabaseAdmin.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_count: topK,
      filter_doc_id: documentId,
    });

    if (rpcErr || !matchedChunks || matchedChunks.length === 0) {
      console.warn('[RETRIEVAL RPC FALLBACK] RPC query failed or empty, falling back to top chunks:', rpcErr?.message);
      return {
        chunks: allChunks.slice(0, topK),
        rag_used: true,
        strategy_explanation: `RAG vector match fallback to top ${topK} indexed chunks.`,
      };
    }

    return {
      chunks: matchedChunks,
      rag_used: true,
      strategy_explanation: `Top-${matchedChunks.length} semantic vector similarity match for document (${allChunks.length} total chunks).`,
    };
  } catch (err) {
    console.error('[RETRIEVAL ERROR] Vector search failed, falling back to chunk slice:', err.message);
    return {
      chunks: allChunks.slice(0, topK),
      rag_used: false,
      strategy_explanation: 'Vector match failed; fallback to sequential chunks.',
    };
  }
}

module.exports = {
  retrieveDocumentChunks,
};
