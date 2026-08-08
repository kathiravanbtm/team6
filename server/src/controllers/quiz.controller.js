const { retrieveDocumentChunks } = require('../services/retrieval.service');
const { generateQuiz } = require('../services/generation.service');
const { supabaseAdmin } = require('../config/supabase');

/**
 * POST /api/quiz/generate
 * Generates an AI quiz from document chunks.
 */
async function generateQuizController(req, res, next) {
  const reqStart = Date.now();
  try {
    const { document_id, num_questions = 5, difficulty = 'medium', topic_query } = req.body;

    if (!document_id) {
      return res.status(400).json({ error: 'document_id is required' });
    }

    const userId = req.user?.id;

    // 1. RAG / Chunk Retrieval
    const retrievalStart = Date.now();
    const { chunks, rag_used, strategy_explanation } = await retrieveDocumentChunks(document_id, {
      topicQuery: topic_query,
      topK: Math.min(Math.max(num_questions * 2, 5), 10),
    });
    const retrievalTimeMs = Date.now() - retrievalStart;

    // 2. LLM Generation with strict Zod validation
    const genStart = Date.now();
    const quizData = await generateQuiz(chunks, {
      numQuestions: Number(num_questions),
      difficulty,
    });
    const genTimeMs = Date.now() - genStart;

    // 3. Database Insertion
    const { data: documentInfo } = await supabaseAdmin
      .from('documents')
      .select('title')
      .eq('id', document_id)
      .single();

    const quizTitle = quizData.title || `Quiz: ${documentInfo?.title || 'Study Material'}`;

    const { data: quizRecord, error: quizErr } = await supabaseAdmin
      .from('quizzes')
      .insert({
        document_id,
        user_id: userId,
        title: quizTitle,
      })
      .select('id, document_id, user_id, title, created_at')
      .single();

    if (quizErr) {
      throw new Error(`Failed to create quiz record: ${quizErr.message}`);
    }

    const questionRecords = quizData.questions.map(q => ({
      quiz_id: quizRecord.id,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      source_chunk_id: q.source_chunk_id,
      difficulty: q.difficulty || difficulty,
    }));

    const { data: savedQuestions, error: qErr } = await supabaseAdmin
      .from('questions')
      .insert(questionRecords)
      .select('*');

    if (qErr) {
      throw new Error(`Failed to save quiz questions: ${qErr.message}`);
    }

    const totalTimeMs = Date.now() - reqStart;
    console.log(`[PERF SUMMARY] Quiz Generation finished in ${totalTimeMs}ms (Retrieval: ${retrievalTimeMs}ms, Gen: ${genTimeMs}ms)`);

    return res.status(201).json({
      quiz_id: quizRecord.id,
      document_id: quizRecord.document_id,
      title: quizRecord.title,
      created_at: quizRecord.created_at,
      questions: savedQuestions,
      rag_metadata: {
        rag_used,
        strategy_explanation,
        retrieved_chunks_count: chunks.length,
      },
      performance: {
        total_time_ms: totalTimeMs,
        retrieval_time_ms: retrievalTimeMs,
        generation_time_ms: genTimeMs,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/quiz/:id
 * Fetches a quiz along with all its questions.
 */
async function getQuizById(req, res, next) {
  try {
    const { id } = req.params;

    const { data: quiz, error: quizErr } = await supabaseAdmin
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (quizErr || !quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const { data: questions, error: qErr } = await supabaseAdmin
      .from('questions')
      .select('id, quiz_id, question_text, options, explanation, source_chunk_id, difficulty')
      .eq('quiz_id', id);

    if (qErr) {
      throw new Error(`Failed to fetch quiz questions: ${qErr.message}`);
    }

    return res.json({
      ...quiz,
      questions: questions || [],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/quiz/:id/submit
 * Server-side scoring of quiz submissions & attempt recording.
 */
async function submitQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const { answers } = req.body; // Array of { question_id, selected }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'answers must be an array of { question_id, selected }' });
    }

    const userId = req.user?.id;

    // Fetch correct answers for quiz
    const { data: questions, error: qErr } = await supabaseAdmin
      .from('questions')
      .select('id, question_text, correct_answer, explanation, source_chunk_id')
      .eq('quiz_id', id);

    if (qErr || !questions) {
      return res.status(404).json({ error: 'Quiz or questions not found' });
    }

    const qMap = new Map(questions.map(q => [q.id, q]));

    let correctCount = 0;
    const detailedResults = [];

    for (const ans of answers) {
      const q = qMap.get(ans.question_id);
      if (q) {
        const isCorrect = ans.selected?.trim() === q.correct_answer?.trim();
        if (isCorrect) correctCount++;

        detailedResults.push({
          question_id: q.id,
          question_text: q.question_text,
          selected: ans.selected,
          correct_answer: q.correct_answer,
          is_correct: isCorrect,
          explanation: q.explanation,
          source_chunk_id: q.source_chunk_id,
        });
      }
    }

    const scorePercentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    // Record attempt in database
    const { data: attempt, error: attemptErr } = await supabaseAdmin
      .from('attempts')
      .insert({
        quiz_id: id,
        user_id: userId,
        answers: answers,
        score: scorePercentage,
      })
      .select('id, quiz_id, user_id, score, created_at')
      .single();

    if (attemptErr) {
      console.error('[ATTEMPT RECORD ERROR]', attemptErr.message);
    }

    return res.json({
      attempt_id: attempt?.id,
      score: scorePercentage,
      correct_count: correctCount,
      total_questions: questions.length,
      results: detailedResults,
      created_at: attempt?.created_at || new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateQuizController,
  getQuizById,
  submitQuiz,
};
