/**
 * Clustering Web Worker
 * Groups related pages using semantic similarity
 */

interface ClusterRequest {
  embeddings: Array<{ id: string; vector: number[] }>;
}

interface ClusterResponse {
  clusters: Array<{
    id: string;
    pages: string[];
  }>;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

function clusterPages(
  embeddings: Array<{ id: string; vector: number[] }>,
  threshold = 0.5
): Array<{ id: string; pages: string[] }> {
  const clusters: Array<{ id: string; pages: string[] }> = [];
  const assigned = new Set<string>();

  for (const item of embeddings) {
    if (assigned.has(item.id)) continue;

    const cluster: { id: string; pages: string[] } = {
      id: `cluster_${clusters.length}`,
      pages: [item.id],
    };
    assigned.add(item.id);

    // Find similar pages
    for (const other of embeddings) {
      if (assigned.has(other.id)) continue;

      const similarity = cosineSimilarity(item.vector, other.vector);
      if (similarity >= threshold) {
        cluster.pages.push(other.id);
        assigned.add(other.id);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

self.onmessage = (event: MessageEvent<ClusterRequest>) => {
  try {
    const { embeddings } = event.data;
    const clusters = clusterPages(embeddings);

    const response: ClusterResponse = {
      clusters,
    };

    self.postMessage(response);
  } catch (error) {
    console.error("Clustering error:", error);
    self.postMessage({ clusters: [] });
  }
};

export {}; // Mark as module
