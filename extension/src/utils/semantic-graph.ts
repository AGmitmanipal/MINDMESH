/**
 * Semantic Graph Builder
 * Creates relationships between pages based on semantic similarity
 */

import type { MemoryNode, Embedding } from "@shared/extension-types";
import { cosineSimilarity } from "./vector-search";
import { cortexStorage } from "./storage";

export interface GraphEdge {
  id: string;
  fromNode: string;
  toNode: string;
  strength: number;
  timestamp: number;
}

export interface GraphNode {
  id: string;
  node: MemoryNode;
  connections: string[];
}

/**
 * Build semantic graph by connecting similar pages
 */
export class SemanticGraphBuilder {
  private minSimilarity = 0.6; // Minimum similarity to create edge
  private maxEdgesPerNode = 10; // Limit edges per node for performance

  /**
   * Update graph with new node
   */
  async addNode(node: MemoryNode, embedding: Embedding): Promise<void> {
    // Get all existing embeddings
    const allEmbeddings = await cortexStorage.getAllEmbeddings();
    
    // Find similar nodes
    const similarNodes: Array<{ nodeId: string; similarity: number }> = [];
    
    for (const { nodeId, embedding: existingEmbedding } of allEmbeddings) {
      if (nodeId === node.id) continue; // Skip self
      
      const similarity = cosineSimilarity(embedding.vector, existingEmbedding.vector);
      if (similarity >= this.minSimilarity) {
        similarNodes.push({ nodeId, similarity });
      }
    }

    // Sort by similarity and take top N
    similarNodes.sort((a, b) => b.similarity - a.similarity);
    const topSimilar = similarNodes.slice(0, this.maxEdgesPerNode);

    // Create bidirectional edges
    for (const { nodeId, similarity } of topSimilar) {
      await cortexStorage.addGraphEdge(node.id, nodeId, similarity);
      await cortexStorage.addGraphEdge(nodeId, node.id, similarity);
    }
  }

  /**
   * Get semantic neighbors of a node
   */
  async getNeighbors(nodeId: string, limit: number = 5): Promise<MemoryNode[]> {
    return cortexStorage.getRelatedNodes(nodeId, limit);
  }

  /**
   * Find paths between two nodes (for explainability)
   */
  async findPath(fromNodeId: string, toNodeId: string, maxDepth: number = 3): Promise<string[]> {
    // Simple BFS path finding
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; path: string[] }> = [{ nodeId: fromNodeId, path: [fromNodeId] }];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (nodeId === toNodeId) {
        return path;
      }

      if (path.length >= maxDepth) continue;
      if (visited.has(nodeId)) continue;

      visited.add(nodeId);
      const neighbors = await cortexStorage.getRelatedNodes(nodeId, 10);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          queue.push({ nodeId: neighbor.id, path: [...path, neighbor.id] });
        }
      }
    }

    return []; // No path found
  }

  /**
   * Get graph statistics
   */
  async getGraphStats(): Promise<{
    nodeCount: number;
    edgeCount: number;
    avgDegree: number;
    clusters: number;
  }> {
    const stats = await cortexStorage.getStats();
    const nodeCount = stats.pageCount;
    const edgeCount = stats.edgeCount;
    const avgDegree = nodeCount > 0 ? (edgeCount / nodeCount) * 2 : 0; // *2 because edges are bidirectional

    // Simple cluster detection (connected components)
    const clusters = await this.detectClusters();

    return {
      nodeCount,
      edgeCount,
      avgDegree,
      clusters,
    };
  }

  /**
   * Detect clusters (connected components)
   */
  private async detectClusters(): Promise<number> {
    const allNodes = await cortexStorage.getAllMemoryNodes();
    const visited = new Set<string>();
    let clusterCount = 0;

    for (const node of allNodes) {
      if (visited.has(node.id)) continue;

      // BFS to mark all connected nodes
      const queue = [node.id];
      visited.add(node.id);

      while (queue.length > 0) {
        const currentNodeId = queue.shift()!;
        const neighbors = await cortexStorage.getRelatedNodes(currentNodeId, 100);

        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.id)) {
            visited.add(neighbor.id);
            queue.push(neighbor.id);
          }
        }
      }

      clusterCount++;
    }

    return clusterCount;
  }
}

export const semanticGraphBuilder = new SemanticGraphBuilder();

