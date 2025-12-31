/**
 * Vector Search Engine
 * Fast approximate nearest neighbor search for semantic similarity
 */

import type { Embedding, MemoryNode, SemanticMatch } from "@shared/extension-types";

export interface VectorIndex {
  add(nodeId: string, vector: number[]): void;
  search(queryVector: number[], k: number, threshold?: number): Array<{ nodeId: string; similarity: number }>;
  remove(nodeId: string): void;
  clear(): void;
}

/**
 * Simple brute-force vector index
 * For production, consider HNSW or other ANN algorithms
 */
export class BruteForceIndex implements VectorIndex {
  private vectors: Map<string, number[]> = new Map();

  add(nodeId: string, vector: number[]): void {
    this.vectors.set(nodeId, vector);
  }

  search(
    queryVector: number[],
    k: number = 10,
    threshold: number = 0.5
  ): Array<{ nodeId: string; similarity: number }> {
    const results: Array<{ nodeId: string; similarity: number }> = [];

    for (const [nodeId, vector] of this.vectors.entries()) {
      const similarity = cosineSimilarity(queryVector, vector);
      if (similarity >= threshold) {
        results.push({ nodeId, similarity });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  remove(nodeId: string): void {
    this.vectors.delete(nodeId);
  }

  clear(): void {
    this.vectors.clear();
  }
}

/**
 * Approximate Nearest Neighbors Index using Random Projection Hashing
 * Faster than brute force for large datasets
 */
export class ANNIndex implements VectorIndex {
  private vectors: Map<string, number[]> = new Map();
  private hashes: Map<string, number> = new Map();
  private buckets: Map<number, string[]> = new Map();
  private projectionMatrix: number[][] = [];
  private numHashes = 16;
  private dim = 384;

  constructor() {
    // Generate fixed random projection matrix
    for (let i = 0; i < this.numHashes; i++) {
      const row = [];
      for (let j = 0; j < this.dim; j++) {
        row.push(Math.random() * 2 - 1);
      }
      this.projectionMatrix.push(row);
    }
  }

  private computeHash(vector: number[]): number {
    let hash = 0;
    for (let i = 0; i < this.numHashes; i++) {
      let dot = 0;
      for (let j = 0; j < this.dim; j++) {
        dot += vector[j] * this.projectionMatrix[i][j];
      }
      if (dot > 0) {
        hash |= (1 << i);
      }
    }
    return hash;
  }

  add(nodeId: string, vector: number[]): void {
    this.vectors.set(nodeId, vector);
    const hash = this.computeHash(vector);
    this.hashes.set(nodeId, hash);
    
    if (!this.buckets.has(hash)) {
      this.buckets.set(hash, []);
    }
    this.buckets.get(hash)!.push(nodeId);
  }

  search(
    queryVector: number[],
    k: number = 10,
    threshold: number = 0.4
  ): Array<{ nodeId: string; similarity: number }> {
    const queryHash = this.computeHash(queryVector);
    const candidates = new Set<string>();
    
    // Search in the same bucket and similar buckets (1-bit flip)
    const searchHashes = [queryHash];
    for (let i = 0; i < this.numHashes; i++) {
      searchHashes.push(queryHash ^ (1 << i));
    }

    for (const h of searchHashes) {
      const bucket = this.buckets.get(h);
      if (bucket) {
        bucket.forEach(id => candidates.add(id));
      }
    }

    // If too few candidates, fall back to brute force over a larger subset or all
    if (candidates.size < k) {
      for (const nodeId of this.vectors.keys()) {
        candidates.add(nodeId);
        if (candidates.size > 100) break; // Limit fallback
      }
    }

    const results: Array<{ nodeId: string; similarity: number }> = [];
    for (const nodeId of candidates) {
      const vector = this.vectors.get(nodeId)!;
      const similarity = cosineSimilarity(queryVector, vector);
      if (similarity >= threshold) {
        results.push({ nodeId, similarity });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  remove(nodeId: string): void {
    const hash = this.hashes.get(nodeId);
    if (hash !== undefined) {
      const bucket = this.buckets.get(hash);
      if (bucket) {
        this.buckets.set(hash, bucket.filter(id => id !== nodeId));
      }
    }
    this.hashes.delete(nodeId);
    this.vectors.delete(nodeId);
  }

  clear(): void {
    this.vectors.clear();
    this.hashes.clear();
    this.buckets.clear();
  }
}

/**
 * Cosine similarity calculation
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    console.warn("Vector length mismatch:", vecA.length, vecB.length);
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Normalize vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) return vector;
  return vector.map((val) => val / norm);
}

/**
 * Find shared keywords between query and node
 */
export function findSharedKeywords(
  queryText: string,
  node: MemoryNode
): string[] {
  const queryWords = new Set(
    queryText
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  return node.keywords.filter((kw) => queryWords.has(kw.toLowerCase()));
}

/**
 * Enhanced semantic match with explainability
 */
export function createSemanticMatch(
  node: MemoryNode,
  similarity: number,
  queryText: string
): SemanticMatch {
  const sharedKeywords = findSharedKeywords(queryText, node);
  
  // Generate context match explanation
  const contextMatch = generateContextMatch(queryText, node);

  return {
    nodeId: node.id,
    similarity,
    node,
    reason: {
      sharedKeywords,
      contextMatch,
      semanticSimilarity: similarity,
    },
  };
}

function generateContextMatch(queryText: string, node: MemoryNode): string {
  const queryLower = queryText.toLowerCase();
  const titleLower = node.title.toLowerCase();
  const textLower = node.readableText.toLowerCase().slice(0, 500);
  const domainLower = node.metadata.domain.toLowerCase();

  if (titleLower === queryLower) {
    return "Exact title match";
  }

  if (titleLower.includes(queryLower)) {
    return "Title contains query terms";
  }

  if (domainLower.includes(queryLower)) {
    return "Domain contains query terms";
  }

  if (textLower.includes(queryLower)) {
    return "Content contains query terms";
  }

  if (node.keywords.some((kw) => queryLower.includes(kw.toLowerCase()))) {
    return "Shared keywords match";
  }

  return "Semantic similarity match";
}

/**
 * Calculate hybrid search score with title/domain boosting
 * Boosts semantic similarity based on exact matches in title and domain
 */
export function calculateHybridScore(
  semanticSimilarity: number,
  node: MemoryNode,
  query: string
): number {
  const queryLower = query.toLowerCase();
  const titleLower = node.title.toLowerCase();
  const domainLower = node.metadata.domain.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  let score = semanticSimilarity;
  
  // Exact title match = huge boost (40%)
  if (titleLower === queryLower) {
    score = Math.min(1.0, score + 0.4);
  }
  // Title contains exact query = large boost (25%)
  else if (titleLower.includes(queryLower)) {
    score = Math.min(1.0, score + 0.25);
  }
  // All query words in title = medium boost (20%)
  else if (queryWords.every(word => titleLower.includes(word))) {
    score = Math.min(1.0, score + 0.2);
  }
  // Some query words in title = small boost (10%)
  else if (queryWords.some(word => titleLower.includes(word))) {
    score = Math.min(1.0, score + 0.1);
  }
  
  // Domain contains query = medium boost (15%)
  if (domainLower.includes(queryLower)) {
    score = Math.min(1.0, score + 0.15);
  }
  // Domain contains query words = small boost (8%)
  else if (queryWords.some(word => domainLower.includes(word))) {
    score = Math.min(1.0, score + 0.08);
  }
  
  return score;
}

