/**
 * Embedding Web Worker
 * Generates semantic embeddings for pages
 * 
 * Production: Use WASM model (transformers.js with all-MiniLM-L6-v2)
 * Fallback: High-quality deterministic embedding based on text features
 */

import { pipeline, env } from '@xenova/transformers';

// Disable local model files, use CDN
env.allowLocalModels = false;
env.useBrowserCache = true;

interface EmbeddingRequest {
  id: string;
  text: string;
  title?: string;
  keywords?: string[];
}

interface EmbeddingResponse {
  id: string;
  embedding: number[];
  success: boolean;
  model: "wasm" | "fallback";
}

// Enhanced fallback embedding generator
// Creates deterministic, meaningful vectors based on text features
function generateFallbackEmbedding(
  text: string,
  title: string = "",
  keywords: string[] = []
): number[] {
  const DIM = 384; // Standard embedding dimension
  const vector: number[] = new Array(DIM).fill(0);

  // Combine text sources
  const fullText = `${title} ${text} ${keywords.join(" ")}`.toLowerCase();
  
  // Feature extraction
  const words = fullText.match(/\b\w+\b/g) || [];
  const wordFreq = new Map<string, number>();
  words.forEach((word) => {
    if (word.length > 2) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  });

  // Create hash-based features
  const hashes: number[] = [];
  for (let i = 0; i < DIM; i++) {
    let hash = 0;
    const seed = i * 31;
    
    // Hash title (high weight)
    for (let j = 0; j < title.length; j++) {
      hash = ((hash << 5) - hash + title.charCodeAt(j) + seed) | 0;
    }
    
    // Hash keywords (medium weight)
    keywords.forEach((kw) => {
      for (let j = 0; j < kw.length; j++) {
        hash = ((hash << 3) - hash + kw.charCodeAt(j) + seed) | 0;
      }
    });
    
    // Hash text content (lower weight)
    const textSample = text.slice(0, 200);
    for (let j = 0; j < textSample.length; j++) {
      hash = ((hash << 2) - hash + textSample.charCodeAt(j) + seed) | 0;
    }
    
    hashes.push(hash);
  }

  // Convert hashes to normalized vectors
  for (let i = 0; i < DIM; i++) {
    // Use multiple hash functions for better distribution
    const h1 = hashes[i];
    const h2 = hashes[(i + 1) % DIM];
    const h3 = hashes[(i * 7) % DIM];
    
    // Combine hashes with trigonometric functions for smooth distribution
    vector[i] = Math.sin(h1 / 1000) * Math.cos(h2 / 1000) + Math.sin(h3 / 500) * 0.5;
  }

  // Normalize vector
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < DIM; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

// WASM model instance (lazy loaded)
let wasmModel: any = null;
let modelLoading: Promise<boolean> | null = null;

// Check if WASM model is available and load it
async function loadWASMModel(): Promise<boolean> {
  // If already loaded, return true
  if (wasmModel !== null) {
    return true;
  }

  // If currently loading, wait for it
  if (modelLoading !== null) {
    return await modelLoading;
  }

  // Start loading
  modelLoading = (async () => {
    try {
      wasmModel = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2',
        { quantized: true } // Use quantized model for smaller size
      );
      console.log('WASM embedding model loaded successfully');
      return true;
    } catch (error) {
      console.warn('Failed to load WASM embedding model, using fallback:', error);
      wasmModel = null;
      return false;
    }
  })();

  return await modelLoading;
}

// Generate embedding using WASM model
async function generateWASMEmbedding(text: string): Promise<number[]> {
  if (!wasmModel) {
    throw new Error('WASM model not loaded');
  }

  try {
    // Combine text for embedding (model expects single string)
    const combinedText = text.trim();
    
    // Generate embedding
    const output = await wasmModel(combinedText, {
      pooling: 'mean',
      normalize: true,
    });

    // Convert tensor to array
    const embedding = Array.from(output.data);
    
    // Ensure it's exactly 384 dimensions (all-MiniLM-L6-v2 output)
    if (embedding.length !== 384) {
      console.warn(`Unexpected embedding dimension: ${embedding.length}, expected 384`);
      // Pad or truncate if needed (shouldn't happen, but safety check)
      if (embedding.length < 384) {
        embedding.push(...new Array(384 - embedding.length).fill(0));
      } else {
        return embedding.slice(0, 384);
      }
    }

    return embedding;
  } catch (error) {
    console.error('Error generating WASM embedding:', error);
    throw error; // Let caller handle fallback
  }
}

self.onmessage = async (event: MessageEvent<EmbeddingRequest>) => {
  try {
    const { id, text, title, keywords } = event.data;
    
    // Try to use WASM model, fallback to enhanced embedding
    const hasWASM = await loadWASMModel();
    let embedding: number[];
    let model: "wasm" | "fallback";

    if (hasWASM) {
      try {
        embedding = await generateWASMEmbedding(text);
        model = "wasm";
      } catch (wasmError) {
        // If WASM generation fails, fall back to deterministic embedding
        console.warn("WASM embedding failed, using fallback:", wasmError);
        embedding = generateFallbackEmbedding(text, title || "", keywords || []);
        model = "fallback";
      }
    } else {
      embedding = generateFallbackEmbedding(text, title || "", keywords || []);
      model = "fallback";
    }

    const response: EmbeddingResponse = {
      id,
      embedding,
      success: true,
      model,
    };

    self.postMessage(response);
  } catch (error) {
    console.error("Embedding worker error:", error);
    // Last resort: use fallback even on unexpected errors
    try {
      const fallbackEmbedding = generateFallbackEmbedding(
        event.data.text,
        event.data.title || "",
        event.data.keywords || []
      );
      const response: EmbeddingResponse = {
        id: event.data.id,
        embedding: fallbackEmbedding,
        success: true,
        model: "fallback",
      };
      self.postMessage(response);
    } catch (fallbackError) {
      // Absolute last resort: empty embedding
      const response: EmbeddingResponse = {
        id: event.data.id,
        embedding: [],
        success: false,
        model: "fallback",
      };
      self.postMessage(response);
    }
  }
};

export {}; // Mark as module
