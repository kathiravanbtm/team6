/**
 * Sentence-boundary aware text chunker.
 * Targets ~600 tokens per chunk (~450 words) with ~100 tokens overlap (~75 words).
 * 
 * @param {string} text - Raw input document text
 * @param {Object} options
 * @param {number} [options.targetWords=450] - Target words per chunk (~600 tokens)
 * @param {number} [options.overlapWords=75] - Overlap words between consecutive chunks (~100 tokens)
 * @returns {Array<{ chunk_index: number, content: string, word_count: number }>}
 */
function chunkText(text, options = {}) {
  const targetWords = options.targetWords || 450;
  const overlapWords = options.overlapWords || 75;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split text into sentences using regex boundary
  const sentences = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (sentences.length === 0) {
    return [{ chunk_index: 0, content: text.trim(), word_count: text.trim().split(/\s+/).length }];
  }

  const chunks = [];
  let currentSentences = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const sentenceWordCount = sentence.split(/\s+/).length;

    currentSentences.push(sentence);
    currentWordCount += sentenceWordCount;

    // When threshold target is reached or at last sentence
    if (currentWordCount >= targetWords || i === sentences.length - 1) {
      const chunkContent = currentSentences.join(' ');
      chunks.push({
        chunk_index: chunkIndex++,
        content: chunkContent,
        word_count: currentWordCount,
      });

      // Prepare overlap for next chunk
      if (i < sentences.length - 1) {
        let overlapCount = 0;
        const newSentences = [];

        // Backtrack from current sentences to keep overlap
        for (let j = currentSentences.length - 1; j >= 0; j--) {
          const s = currentSentences[j];
          const wordsInS = s.split(/\s+/).length;
          newSentences.unshift(s);
          overlapCount += wordsInS;

          if (overlapCount >= overlapWords) {
            break;
          }
        }

        currentSentences = newSentences;
        currentWordCount = overlapCount;
      }
    }
  }

  return chunks;
}

module.exports = {
  chunkText,
};
