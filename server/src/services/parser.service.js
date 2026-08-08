const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const axios = require('axios');

/**
 * Extracts plain text from PDF buffer, URL, or raw text input.
 * @param {Object} options
 * @param {Buffer} [options.buffer] - PDF file buffer if uploaded as file
 * @param {string} [options.url] - URL to fetch and parse
 * @param {string} [options.text] - Plain text content
 * @returns {Promise<{ raw_text: string, title: string, source_type: string }>}
 */
async function parseDocument({ buffer, url, text }) {
  const startTime = Date.now();
  let rawText = '';
  let sourceType = 'text';
  let title = 'Untitled Document';

  if (buffer) {
    sourceType = 'pdf';
    const pdfData = await pdfParse(buffer);
    rawText = pdfData.text || '';
    title = pdfData.info?.Title || `PDF Document (${pdfData.numpages || 1} pages)`;
  } else if (url) {
    sourceType = 'url';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    
    // Extract title
    title = $('title').text().trim() || $('h1').first().text().trim() || url;

    // Strip non-content tags
    $('script, style, noscript, nav, header, footer, iframe, svg').remove();

    // Extract text from main container or body
    const mainContent = $('main, article, #content, .content, body');
    rawText = mainContent.text().replace(/\s+/g, ' ').trim();
  } else if (text) {
    sourceType = 'text';
    rawText = text.trim();
    // Derive title from first line or snippet
    const firstLine = rawText.split('\n')[0].replace(/[^\w\s]/gi, '').trim();
    title = firstLine ? firstLine.substring(0, 50) : 'Text Document';
  } else {
    throw new Error('No valid content provided (file buffer, URL, or text required)');
  }

  // Clean raw text
  rawText = rawText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  const durationMs = Date.now() - startTime;
  // LOG TIMING WITHOUT LOGGING RAW CONTENT (Privacy requirement)
  console.log(`[PERF TIMING] Parse step completed in ${durationMs}ms | Source: ${sourceType} | Extracted length: ${rawText.length} chars`);

  return {
    raw_text: rawText,
    title,
    source_type: sourceType,
    parse_time_ms: durationMs,
  };
}

module.exports = {
  parseDocument,
};
