/**
 * Embedding Utilities
 * Generates semantic embeddings for pages using deterministic text features
 * 
 * dimension: 384
 */

export interface EmbeddingResult {
  vector: number[];
  model: "fallback";
}

/**
 * Enhanced fallback embedding generator
 * Creates deterministic, meaningful vectors based on text features
 */
export function generateEmbedding(
  text: string,
  title: string = "",
  keywords: string[] = []
): EmbeddingResult {
  const DIM = 384; // Standard embedding dimension
  const vector: number[] = new Array(DIM).fill(0);

  // Combine text sources for single pass processing
  const textSample = text.slice(0, 1000).toLowerCase();
  const titleLow = title.toLowerCase();
  const keywordsStr = keywords.join(" ").toLowerCase();
  
  // Single pass to generate seed hashes
  const hashString = (str: string, seed: number = 0) => {
    let h = seed;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return h;
  };

  // Generate a set of base hashes from different inputs
  const baseHashes = [
    hashString(titleLow, 123),
    hashString(keywordsStr, 456),
    hashString(textSample.slice(0, 500), 789),
    hashString(textSample.slice(500, 1000), 321),
    hashString(titleLow + keywordsStr, 654)
  ];

  // Derive the 384 dimensions from base hashes using a fast deterministic function
  for (let i = 0; i < DIM; i++) {
    const hashIdx = i % baseHashes.length;
    const baseHash = baseHashes[hashIdx];
    const mix = hashString(i.toString(), baseHash);
    
    // Use trig functions for smooth distribution as before, but on pre-mixed values
    vector[i] = Math.sin(mix / 1000) * 0.8 + Math.cos((mix ^ i) / 500) * 0.2;
  }

  // Normalize vector
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < DIM; i++) {
      vector[i] /= norm;
    }
  }

  return {
    vector,
    model: "fallback"
  };
}

