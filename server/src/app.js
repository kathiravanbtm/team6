const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { authenticate } = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/errorHandler');

const documentsRoutes = require('./routes/documents.routes');
const quizRoutes = require('./routes/quiz.routes');
const flashcardsRoutes = require('./routes/flashcards.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Core Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'LearnForge AI Quiz Generator API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to LearnForge AI Quiz Generator Backend API',
    documentation: {
      health: 'GET /health',
      upload: 'POST /api/documents/upload',
      generate_quiz: 'POST /api/quiz/generate',
      get_quiz: 'GET /api/quiz/:id',
      submit_quiz: 'POST /api/quiz/:id/submit',
      generate_flashcards: 'POST /api/flashcards/generate',
      get_flashcards: 'GET /api/flashcards/:document_id',
    },
  });
});

// Authenticated API Routes
app.use('/api', authenticate);
app.use('/api/documents', documentsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/flashcards', flashcardsRoutes);

// Catch-all 404 Route
app.use((req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handler
app.use(errorHandler);

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  LearnForge Express Backend running on port ${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/health`);
    console.log(`  API Base URL: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
}

module.exports = app;
