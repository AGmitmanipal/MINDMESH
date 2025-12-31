/**
 * Recall Service
 * Semantic search and memory retrieval
 */

import type { MemoryNode, SemanticMatch } from "@shared/extension-types";
import { cortexStorage } from "../utils/storage";
import { createSemanticMatch, calculateHybridScore } from "../utils/vector-search";
import { generateEmbedding } from "../utils/embedding";

export interface RecallResult {
  matches: SemanticMatch[];
  query: string;
  timestamp: number;
  totalResults: number;
}

export class RecallService {
  /**
   * Hybrid search: semantic similarity + keyword + title/domain boosting
   * Combines multiple search strategies for optimal relevance
   */
  async search(
    query: string,
    limit: number = 10,
    threshold: number = 0.3  // Lower threshold to get more results
  ): Promise<RecallResult> {
    try {
      console.log(`RecallService: Hybrid search for "${query}", limit: ${limit}, threshold: ${threshold}`);
      
      // 1. Generate query embedding for semantic search
      console.log("RecallService: Generating query embedding...");
      const queryEmbedding = generateEmbedding(query, query, []);
      console.log("RecallService: Query embedding generated, dimension:", queryEmbedding.vector.length);
      
      // 2. Get semantic matches (get more candidates for boosting)
      console.log("RecallService: Starting vector search...");
      const semanticMatches = await cortexStorage.vectorSearch(queryEmbedding.vector, limit * 2, threshold);
      console.log(`RecallService: Found ${semanticMatches.length} semantic matches`);
      
      // 3. Boost matches where title/domain contains query terms
      const boostedMatches = semanticMatches.map(match => {
        const hybridScore = calculateHybridScore(match.similarity, match.node, query);
        return {
          ...match,
          similarity: hybridScore,
        };
      });
      
      // 4. Also perform keyword search for exact matches
      console.log("RecallService: Starting keyword search...");
      const keywordNodes = await cortexStorage.searchMemoryNodes(query, limit);
      const keywordMatches = keywordNodes.map(node => {
        // Calculate hybrid score for keyword matches too
        const baseScore = 0.5; // Base score for keyword matches
        const hybridScore = calculateHybridScore(baseScore, node, query);
        return createSemanticMatch(node, hybridScore, query);
      });
      
      console.log(`RecallService: Found ${keywordMatches.length} keyword matches`);
      
      // 5. Merge and deduplicate results
      const allMatches = [...boostedMatches, ...keywordMatches];
      const uniqueMatches = new Map<string, SemanticMatch>();
      
      allMatches.forEach(match => {
        const existing = uniqueMatches.get(match.nodeId);
        // Keep the match with higher similarity score
        if (!existing || match.similarity > existing.similarity) {
          uniqueMatches.set(match.nodeId, match);
        }
      });
      
      // 6. Sort by boosted similarity and return top results
      const finalMatches = Array.from(uniqueMatches.values())
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
      
      console.log(`RecallService: Returning ${finalMatches.length} merged results`);

      return {
        matches: finalMatches,
        query,
        timestamp: Date.now(),
        totalResults: finalMatches.length,
      };
    } catch (error) {
      console.error("RecallService: Search error:", error);
      // Return empty results instead of throwing to prevent timeout
      return {
        matches: [],
        query,
        timestamp: Date.now(),
        totalResults: 0,
      };
    }
  }

  /**
   * Get related pages for a given URL
   */
  async getRelatedPages(url: string, limit: number = 5): Promise<MemoryNode[]> {
    const nodes = await cortexStorage.getAllMemoryNodes(1000); // Reasonable scan limit
    const targetNode = nodes.find((n) => n.url === url);

    if (!targetNode) {
      return [];
    }

    // Use semantic graph to find related pages
    return cortexStorage.getRelatedNodes(targetNode.id, limit);
  }

  /**
   * Get recent pages in a time window
   */
  async getRecentPages(
    hours: number = 24,
    limit: number = 20
  ): Promise<MemoryNode[]> {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    // We can use the existing getAllMemoryNodes but we need a date range version
    const allNodes = await cortexStorage.getAllMemoryNodes(limit * 5);
    
    return allNodes
      .filter((node) => node.timestamp >= cutoff)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get pages by domain
   */
  async getPagesByDomain(domain: string): Promise<MemoryNode[]> {
    const nodes = await cortexStorage.getAllMemoryNodes(500);
    return nodes.filter((node) => node.metadata.domain === domain);
  }
}

export const recallService = new RecallService();
