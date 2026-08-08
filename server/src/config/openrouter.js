const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const openrouterKey = process.env.OPENROUTER_API_KEY;

const openrouterClient = axios.create({
  baseURL: 'https://openrouter.ai/api/v1',
  headers: {
    'Authorization': `Bearer ${openrouterKey || ''}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://learnforge.app',
    'X-Title': 'LearnForge AI Quiz Generator',
  },
  timeout: 60000, // 60s timeout for LLM generation
});

module.exports = openrouterClient;
