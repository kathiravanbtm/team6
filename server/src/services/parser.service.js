const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');
const axios = require('axios');
let mammoth;
try {
  mammoth = require('mammoth');
} catch (e) {
  // Safe fallback if mammoth isn't installed yet (will install soon)
  mammoth = null;
}

/**
 * Extracts plain text from PDF buffer, TXT/MD/DOCX buffer, URL, or raw text input.
 * @param {Object} options
 * @param {Buffer} [options.buffer] - PDF/DOCX/TXT/MD file buffer if uploaded as file
 * @param {string} [options.filename] - Original name of the uploaded file
 * @param {string} [options.url] - URL to fetch and parse
 * @param {string} [options.text] - Plain text content
 * @returns {Promise<{ raw_text: string, title: string, source_type: string, parse_time_ms: number }>}
 */
async function parseDocument({ buffer, filename, url, text }) {
  const startTime = Date.now();
  let rawText = '';
  let sourceType = 'text';
  let title = 'Untitled Document';

  if (buffer) {
    const ext = filename ? filename.split('.').pop().toLowerCase() : 'pdf';
    
    if (ext === 'txt' || ext === 'md') {
      sourceType = ext;
      rawText = buffer.toString('utf8');
      title = filename || (ext === 'md' ? 'Markdown Document' : 'Text Document');
    } else if (ext === 'docx') {
      sourceType = 'docx';
      title = filename || 'Word Document';
      if (mammoth) {
        const result = await mammoth.extractRawText({ buffer: buffer });
        rawText = result.value || '';
      } else {
        throw new Error('Mammoth parser is not installed on the server to handle DOCX files.');
      }
    } else {
      sourceType = 'pdf';
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text || '';
      title = pdfData.info?.Title || filename || `PDF Document (${pdfData.numpages || 1} pages)`;
    }
  } else if (url) {
    sourceType = 'url';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    
    title = $('title').text().trim() || $('h1').first().text().trim() || url;

    // Strip non-content tags
    $('script, style, noscript, nav, header, footer, iframe, svg').remove();

    // Extract text from main container or body
    const mainContent = $('main, article, #content, .content, body');
    rawText = mainContent.text().replace(/\s+/g, ' ').trim();
  } else if (text) {
    sourceType = 'text';
    rawText = text.trim();
    const firstLine = rawText.split('\n')[0].replace(/[^\w\s]/gi, '').trim();
    title = firstLine ? firstLine.substring(0, 50) : 'Text Document';
  } else {
    throw new Error('No valid content provided (file buffer, URL, or text required)');
  }

  // Clean raw text
  rawText = rawText.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  const durationMs = Date.now() - startTime;
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
