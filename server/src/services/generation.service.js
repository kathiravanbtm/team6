const { z } = require('zod');
const openrouterClient = require('../config/openrouter');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const LLM_MODEL = process.env.OPENROUTER_LLM_MODEL || 'meta-llama/llama-3.3-70b-instruct';

const openrouterKey = process.env.OPENROUTER_API_KEY;
const isLlmMockMode = !openrouterKey || openrouterKey.includes('your_openrouter_api_key') || openrouterKey === 'placeholder';

if (isLlmMockMode) {
  console.log('====================================================');
  console.log('  [AI GENERATOR] Running in LOCAL NLP FALLBACK mode');
  console.log('  Quizzes/flashcards will be parsed from text locally.');
  console.log('====================================================');
}

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
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

/**
 * Local fallback quiz generator that operates on raw text.
 */
function generateQuizLocally(chunks, options = {}) {
  const numQuestions = options.numQuestions || 5;
  const difficulty = options.difficulty || 'medium';
  
  const questions = [];
  const title = `AI-Generated Quiz: ${chunks[0]?.content?.split(/[.!?\n]/)[0]?.substring(0, 40) || 'Study Materials'}`;
  
  // Gather all sentences from chunks
  const allSentences = chunks.flatMap(c => 
    c.content
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 20)
  );

  const validChunkIds = chunks.map(c => c.id);

  for (let i = 0; i < numQuestions; i++) {
    const chunk = chunks[i % chunks.length];
    const chunkId = chunk.id;
    const content = chunk.content;

    const chunkSentences = content
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    // Pick a sentence from this chunk to formulate a question
    const targetSentence = chunkSentences[i % chunkSentences.length] || `Understanding key concepts and definitions from study selection ${i + 1}.`;

    let questionText = `Which of the following describes the key point: "${targetSentence.substring(0, 60)}..."?`;
    let correctAnswer = targetSentence;
    let explanation = `According to the source text: "${targetSentence}"`;

    // Try to structure it as a definition question if it contains definition terms
    const defMatch = targetSentence.match(/(.*)\b(is|are|refers to|means|defines|consists of|are known as)\b(.*)/i);
    if (defMatch && defMatch[1].trim().split(/\s+/).length < 8) {
      const term = defMatch[1].trim();
      const definition = defMatch[3].trim();
      questionText = `According to the study material, what ${defMatch[2].trim()} "${term}"?`;
      correctAnswer = definition.charAt(0).toUpperCase() + definition.slice(1);
      explanation = `Correct! The text states that: "${term} ${defMatch[2].trim()} ${definition}"`;
    }

    // Collect distractors from other sentences in the document
    const distractors = allSentences.filter(s => s !== targetSentence);
    const selectedDistractors = [];

    // Shuffle and pick 3 unique distractors
    const shuffledDistractors = distractors.sort(() => Math.random() - 0.5);
    for (const dist of shuffledDistractors) {
      if (selectedDistractors.length >= 3) break;
      // Make sure distractor isn't already options
      const formattedDist = dist.charAt(0).toUpperCase() + dist.slice(1);
      if (!selectedDistractors.includes(formattedDist) && formattedDist !== correctAnswer) {
        selectedDistractors.push(formattedDist);
      }
    }

    // Fill in default distractors if we don't have enough
    while (selectedDistractors.length < 3) {
      selectedDistractors.push(`Alternative concept definition #${selectedDistractors.length + 1} regarding this subject.`);
    }

    // Combine correct answer and distractors, then shuffle
    const finalOptions = [correctAnswer, ...selectedDistractors].sort(() => Math.random() - 0.5);

    questions.push({
      question_text: questionText,
      options: finalOptions,
      correct_answer: correctAnswer,
      explanation: explanation,
      difficulty: difficulty === 'adaptive' ? 'medium' : difficulty,
      source_chunk_id: chunkId,
    });
  }

  return {
    title,
    questions,
  };
}

/**
 * Local fallback flashcard generator that operates on raw text.
 */
function generateFlashcardsLocally(chunks, options = {}) {
  const count = options.count || 5;
  const flashcards = [];
  
  // Gather sentences
  const allSentences = chunks.flatMap(c => 
    c.content
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 25)
  );

  for (let i = 0; i < count; i++) {
    const chunk = chunks[i % chunks.length];
    const chunkId = chunk.id;
    const chunkSentences = chunk.content
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 25);

    const sentence = chunkSentences[i % chunkSentences.length] || allSentences[i % allSentences.length] || `Important term and concept from study section #${i + 1}`;

    let front = `Concept Card: ${sentence.split(/[ ,.!?]/).slice(0, 4).join(' ')}...`;
    let back = sentence;

    const defMatch = sentence.match(/(.*)\b(is|are|refers to|means|defines|consists of|are known as)\b(.*)/i);
    if (defMatch && defMatch[1].trim().split(/\s+/).length < 6) {
      front = `What is the definition of "${defMatch[1].trim()}"?`;
      back = `${defMatch[1].trim()} ${defMatch[2].trim()} ${defMatch[3].trim()}`;
    } else {
      front = `Explain the following statement from the study notes: "${sentence.substring(0, 50)}..."?`;
    }

    flashcards.push({
      front,
      back,
      source_chunk_id: chunkId,
    });
  }

  return flashcards;
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

  // Fallback immediately if in mock mode
  if (isLlmMockMode) {
    const mockData = generateQuizLocally(chunks, options);
    console.log(`[AI GENERATOR] Generated ${mockData.questions.length} quiz questions locally (Mock Mode)`);
    return mockData;
  }

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
        correct_answer: q.options.includes(q.correct_answer) ? q.correct_answer : q.options[0],
      }));

      return validatedData;
    } catch (err) {
      console.warn(`[GENERATION RETRY] Quiz generation attempt ${attempt} failed: ${err.message}`);
      lastError = err;
    }
  }

  // Final Try Catch Fallback to Local generator so the backend NEVER crashes
  console.error('[AI GENERATOR FALLBACK] OpenRouter call failed completely. Generating quiz questions locally.');
  return generateQuizLocally(chunks, options);
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

  if (isLlmMockMode) {
    const mockData = generateFlashcardsLocally(chunks, options);
    console.log(`[AI GENERATOR] Generated ${mockData.length} flashcards locally (Mock Mode)`);
    return mockData;
  }

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

  // Final Try Catch Fallback to Local generator so the backend NEVER crashes
  console.error('[AI GENERATOR FALLBACK] OpenRouter call failed completely. Generating flashcards locally.');
  return generateFlashcardsLocally(chunks, options);
}

module.exports = {
  generateQuiz,
  generateFlashcards,
};
