const { z } = require('zod');
const openrouterClient = require('../config/openrouter');
require('dotenv').config();

const LLM_MODEL = process.env.OPENROUTER_LLM_MODEL || 'meta-llama/llama-3.3-70b-instruct';

// Zod schemas for validation
const QuestionSchema = z.object({
  question_text: z.string().min(5),
  options: z.array(z.string()).length(4),
  correct_answer: z.string().min(1),
  explanation: z.string().min(5),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  source_chunk_id: z.string().uuid(),
});

const QuizOutputSchema = z.object({
  title: z.string().optional(),
  questions: z.array(QuestionSchema).min(1),
});

const FlashcardSchema = z.object({
  front: z.string().min(2),
  back: z.string().min(2),
  source_chunk_id: z.string().uuid(),
});

const FlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).min(1),
});

/**
 * Clean LLM JSON string output before parsing
 */
function cleanJsonString(str) {
  if (!str) return '';
  let cleaned = str.trim();
  // Remove markdown code fences if present (```json ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

/**
 * Generates quiz questions from document chunks using OpenRouter LLM.
 * 
 * @param {Array<{ id: string, chunk_index: number, content: string }>} chunks
 * @param {Object} options
 * @param {number} [options.numQuestions=5]
 * @param {string} [options.difficulty='medium'] - easy, medium, hard, or adaptive
 * @returns {Promise<{ title: string, questions: Array }>}
 */
async function generateQuiz(chunks, options = {}) {
  const startTime = Date.now();
  const numQuestions = options.numQuestions || 5;
  const difficulty = options.difficulty || 'medium';

  // Format context for prompt with chunk UUID citations
  const contextText = chunks.map(c => 
    `[CHUNK_ID: ${c.id}]\n${c.content}\n[END CHUNK_ID: ${c.id}]`
  ).join('\n\n---\n\n');

  const validChunkIds = chunks.map(c => c.id);

  const systemPrompt = `You are an expert educational AI quiz generator.
Your job is to read the provided text chunks and generate high-quality practice quiz questions along with clear explanations.

CRITICAL REQUIREMENT - CITATION BACK TO SOURCE:
Every question MUST include a "source_chunk_id" which MUST BE EXACTLY ONE of the provided CHUNK_IDs from the context:
Valid CHUNK_IDs you can use:
${validChunkIds.map(id => `- ${id}`).join('\n')}

OUTPUT FORMAT REQUIREMENT:
You MUST respond with valid raw JSON only. Do not include extra text or markdown wrap outside the JSON object.
JSON Schema:
{
  "title": "A short, engaging quiz title based on context",
  "questions": [
    {
      "question_text": "Clear, challenging question prompt",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Exact string of the correct option matching one of options",
      "explanation": "Detailed explanation citing key facts from the chunk",
      "difficulty": "${difficulty === 'adaptive' ? 'medium' : difficulty}",
      "source_chunk_id": "<MUST BE ONE OF THE VALID CHUNK_IDs LISTED ABOVE>"
    }
  ]
}`;

  const userPrompt = `Generate ${numQuestions} multiple-choice quiz questions with target difficulty "${difficulty}" from the following context:\n\n${contextText}`;

  // Execute LLM call with retry mechanism
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await openrouterClient.post('/chat/completions', {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const durationMs = Date.now() - startTime;
      console.log(`[PERF TIMING] Quiz Generation completed in ${durationMs}ms (Attempt ${attempt}) | Model: ${LLM_MODEL}`);

      const rawContent = response.data?.choices?.[0]?.message?.content;
      const cleanedJson = cleanJsonString(rawContent);

      const parsedJson = JSON.parse(cleanedJson);
      
      // Zod validation
      const validatedData = QuizOutputSchema.parse(parsedJson);

      // Validate source_chunk_id belongs to valid set; if hallucinated, fallback to first chunk ID
      validatedData.questions = validatedData.questions.map(q => ({
        ...q,
        source_chunk_id: validChunkIds.includes(q.source_chunk_id) ? q.source_chunk_id : validChunkIds[0],
        // Ensure correct answer is present in options
        correct_answer: q.options.includes(q.correct_answer) ? q.correct_answer : q.options[0],
      }));

      return validatedData;
    } catch (err) {
      console.warn(`[GENERATION RETRY] Quiz generation attempt ${attempt} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`Failed to generate valid quiz after 2 attempts: ${lastError?.message}`);
}

/**
 * Generates study flashcards from document chunks.
 * 
 * @param {Array<{ id: string, chunk_index: number, content: string }>} chunks
 * @param {Object} options
 * @param {number} [options.count=5]
 * @returns {Promise<Array<{ front: string, back: string, source_chunk_id: string }>>}
 */
async function generateFlashcards(chunks, options = {}) {
  const startTime = Date.now();
  const count = options.count || 5;

  const contextText = chunks.map(c => 
    `[CHUNK_ID: ${c.id}]\n${c.content}\n[END CHUNK_ID: ${c.id}]`
  ).join('\n\n---\n\n');

  const validChunkIds = chunks.map(c => c.id);

  const systemPrompt = `You are an expert AI study assistant.
Generate ${count} effective front/back flashcards from the provided document chunks.

CRITICAL REQUIREMENT:
Every flashcard MUST cite a "source_chunk_id" from one of these valid CHUNK_IDs:
${validChunkIds.map(id => `- ${id}`).join('\n')}

OUTPUT FORMAT:
Respond with raw JSON only.
{
  "flashcards": [
    {
      "front": "Concept, term, or question prompt",
      "back": "Clear concise answer or explanation",
      "source_chunk_id": "<VALID CHUNK_ID>"
    }
  ]
}`;

  const userPrompt = `Context:\n\n${contextText}`;

  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await openrouterClient.post('/chat/completions', {
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const durationMs = Date.now() - startTime;
      console.log(`[PERF TIMING] Flashcard Generation completed in ${durationMs}ms (Attempt ${attempt}) | Model: ${LLM_MODEL}`);

      const cleanedJson = cleanJsonString(response.data?.choices?.[0]?.message?.content);
      const parsedJson = JSON.parse(cleanedJson);
      const validatedData = FlashcardsOutputSchema.parse(parsedJson);

      const sanitizedCards = validatedData.flashcards.map(f => ({
        ...f,
        source_chunk_id: validChunkIds.includes(f.source_chunk_id) ? f.source_chunk_id : validChunkIds[0],
      }));

      return sanitizedCards;
    } catch (err) {
      console.warn(`[GENERATION RETRY] Flashcards attempt ${attempt} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`Failed to generate flashcards after 2 attempts: ${lastError?.message}`);
}

module.exports = {
  generateQuiz,
  generateFlashcards,
};
