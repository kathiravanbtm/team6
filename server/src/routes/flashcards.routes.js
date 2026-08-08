const express = require('express');
const rateLimit = require('express-rate-limit');
const { generateFlashcardsController, getFlashcardsByDocumentId } = require('../controllers/flashcards.controller');

const router = express.Router();

const flashcardGenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many flashcard generation requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/generate', flashcardGenLimiter, generateFlashcardsController);
router.get('/:document_id', getFlashcardsByDocumentId);

module.exports = router;
