const openrouterClient = require('../config/openrouter');
require('dotenv').config();

const EMBEDDING_MODEL = process.env.OPENROUTER_EMBEDDING_MODEL || 'openai/text-embedding-3-small';

/**
 * Generates vector embeddings for a text chunk or list of chunks via OpenRouter.
 * @param {string | string[]} inputs - String or array of chunk text strings
 * @returns {Promise<Array<number[]>>} Array of 1536-dim embedding vector arrays
 */
async function generateEmbeddings(inputs) {
  const startTime = Date.now();
  const inputList = Array.isArray(inputs) ? inputs : [inputs];
  
  if (inputList.length === 0) {
    return [];
  }

  try {
    const response = await openrouterClient.post('/embeddings', {
      model: EMBEDDING_MODEL,
      input: inputList,
    });

    const durationMs = Date.now() - startTime;
    console.log(`[PERF TIMING] Embeddings step completed in ${durationMs}ms | Chunks embedded: ${inputList.length} | Model: ${EMBEDDING_MODEL}`);

    if (response.data && response.data.data) {
      // Sort vectors by index to preserve input order
      const sortedData = response.data.data.sort((a, b) => a.index - b.index);
      return sortedData.map(item => item.embedding);
    }

    throw new Error('Malformed response from OpenRouter Embeddings API');
  } catch (err) {
    console.error(`[EMBEDDING ERROR] Failed to embed ${inputList.length} chunks via ${EMBEDDING_MODEL}:`, err.response?.data || err.message);
    throw err;
  }
}

module.exports = {
  generateEmbeddings,
};
