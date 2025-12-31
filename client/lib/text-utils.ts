/**
 * Text processing utilities for extracting readable content from pages
 * and generating keywords for semantic search
 */

/**
 * Extract readable text from HTML content
 * Removes scripts, styles, and unnecessary markup
 */
export function extractReadableText(html: string): string {
  // Create a temporary container to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Remove script and style elements
  doc.querySelectorAll("script, style, noscript, meta, link").forEach((el) => {
    el.remove();
  });

  // Get text content
  let text = doc.body.textContent || "";

  // Clean up whitespace
  text = text
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .replace(/\n\s*\n/g, "\n") // Remove multiple newlines
    .trim();

  return text.slice(0, 10000); // Limit to 10k characters
}

/**
 * Extract keywords from text using simple frequency analysis
 * In production, this would use NLP or ML models
 */
export function extractKeywords(
  text: string,
  title: string = "",
  limit: number = 10
): string[] {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
    "all",
    "each",
    "every",
    "both",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "same",
    "so",
    "than",
    "too",
    "very",
  ]);

  // Tokenize and filter - handle null from match() when no matches found
  const textMatches = text.toLowerCase().match(/\b\w+\b/g) || [];
  const titleMatches = title.toLowerCase().match(/\b\w+\b/g) || [];
  const words = [
    ...textMatches,
    ...titleMatches,
  ].filter(
    (word) =>
      word.length > 3 &&
      !stopWords.has(word) &&
      !/^\d+$/.test(word)
  );

  // Count frequency
  const frequency = new Map<string, number>();
  words.forEach((word) => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  // Sort by frequency
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Generate a summary of text content
 * Simple extractive summarization
 */
export function generateSummary(text: string, maxLength: number = 200): string {
  // Split into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) return text.slice(0, maxLength);

  // Take first sentences until we reach maxLength
  let summary = "";
  for (const sentence of sentences) {
    if (summary.length + sentence.length < maxLength) {
      summary += sentence + ". ";
    } else {
      break;
    }
  }

  return summary.trim();
}

/**
 * Calculate semantic similarity between two texts
 * Uses simple term overlap (in production would use vector embeddings)
 */
export function calculateTextSimilarity(
  text1: string,
  text2: string
): number {
  const words1 = new Set(text1.toLowerCase().match(/\b\w+\b/g) || []);
  const words2 = new Set(text2.toLowerCase().match(/\b\w+\b/g) || []);

  const intersection = Array.from(words1).filter((word) => words2.has(word));
  const union = new Set([...words1, ...words2]);

  // Jaccard similarity
  return union.size === 0 ? 0 : intersection.length / union.size;
}

/**
 * Clean URL to get domain
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * Extract favicon URL from page
 */
export function getFaviconUrl(pageUrl: string): string {
  try {
    const url = new URL(pageUrl);
    return `${url.protocol}//${url.hostname}/favicon.ico`;
  } catch {
    return "";
  }
}

/**
 * Sanitize text for display
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Create a deterministic ID from URL and timestamp
 */
export function generateMemoryId(url: string, timestamp: number): string {
  const str = `${url}:${timestamp}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `mem_${Math.abs(hash).toString(36)}_${Date.now().toString(36)}`;
}
