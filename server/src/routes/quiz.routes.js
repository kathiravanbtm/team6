const express = require('express');
const rateLimit = require('express-rate-limit');
const { generateQuizController, getQuizById, submitQuiz } = require('../controllers/quiz.controller');

const router = express.Router();

// Rate limiter for generation endpoint
const generationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many quiz generation requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/generate', generationLimiter, generateQuizController);
router.get('/:id', getQuizById);
router.post('/:id/submit', submitQuiz);

module.exports = router;
