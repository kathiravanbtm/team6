const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/documents.controller');

const router = express.Router();

// Multer memory storage configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const allowedExtensions = ['pdf', 'txt', 'md', 'docx'];
    
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      allowedExtensions.includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(new Error('Supported formats: PDF, TXT, MD, DOCX'));
    }
  },
});

// Rate limiting middleware for document uploads (10 uploads per 15 mins)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Increase max slightly for development testing
  message: { error: 'Too many document upload requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/upload', uploadLimiter, upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.delete('/:id', deleteDocument);

module.exports = router;
