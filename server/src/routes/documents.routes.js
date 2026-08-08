const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { uploadDocument } = require('../controllers/documents.controller');

const router = express.Router();

// Multer memory storage configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are supported for file upload'));
    }
  },
});

// Rate limiting middleware for document uploads (10 uploads per 15 mins)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many document upload requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/upload', uploadLimiter, upload.single('file'), uploadDocument);

module.exports = router;
