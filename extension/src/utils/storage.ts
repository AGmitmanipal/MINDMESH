/**
 * Cortex IndexedDB Storage Layer
 * Production-ready storage with proper schema, migrations, and optimizations
 */

import type {
  MemoryNode,
  Embedding,
  MemoryCluster,
  SemanticMatch,
  PrivacyRule,
  CaptureSettings,
  AgentSettings,
  AgentLogEntry,
} from "@shared/extension-types";
import { cosineSimilarity, ANNIndex } from "./vector-search";

const DB_NAME = "cortex-memory";
const DB_VERSION = 2; // Increment for schema changes

const STORES = {
  PAGES: "pages",
  EMBEDDINGS: "embeddings",
  CLUSTERS: "clusters",
  GRAPH_EDGES: "graph_edges",
  SESSIONS: "sessions",
  ACTIVITY: "activity",
  SETTINGS: "settings",
  RULES: "rules",
} as const;

const DEFAULT_AGENT_SETTINGS: AgentSettings = {
  enabled: false,
  dryRun: true,
  allowlistDomains: [],
  perStepTimeoutMs: 15000,
  retries: 1,
  budgets: {
    maxDepth: 3,
    maxActions: 15,
    navigationBudget: 8,
    clickBudget: 10,
  },
  logDomTextMaxChars: 20000,
};

export class CortexStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase>;
  private annIndex: ANNIndex = new ANNIndex();
  private isHydrated: boolean = false;

  constructor() {
    this.initPromise = this.init();
  }

  private async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onupgradeneeded = (event) => {
        // ... store definitions remain same ...
        const db = (event.target as IDBOpenDBRequest).result;

        // Pages store - main memory nodes
        if (!db.objectStoreNames.contains(STORES.PAGES)) {
          const pageStore = db.createObjectStore(STORES.PAGES, { keyPath: "id" });
          pageStore.createIndex("url", "url", { unique: false });
          pageStore.createIndex("domain", "metadata.domain", { unique: false });
          pageStore.createIndex("timestamp", "timestamp", { unique: false });
          pageStore.createIndex("sessionId", "metadata.sessionId", { unique: false });
        }

        // Embeddings store - vector embeddings for semantic search
        if (!db.objectStoreNames.contains(STORES.EMBEDDINGS)) {
          const embeddingStore = db.createObjectStore(STORES.EMBEDDINGS, { keyPath: "nodeId" });
          embeddingStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        // Clusters store - semantic clusters
        if (!db.objectStoreNames.contains(STORES.CLUSTERS)) {
          const clusterStore = db.createObjectStore(STORES.CLUSTERS, { keyPath: "id" });
          clusterStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        // Graph edges - relationships between pages
        if (!db.objectStoreNames.contains(STORES.GRAPH_EDGES)) {
          const edgeStore = db.createObjectStore(STORES.GRAPH_EDGES, { keyPath: "id" });
          edgeStore.createIndex("fromNode", "fromNode", { unique: false });
          edgeStore.createIndex("toNode", "toNode", { unique: false });
          edgeStore.createIndex("strength", "strength", { unique: false });
        }

        // Sessions - browsing sessions
        if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
          const sessionStore = db.createObjectStore(STORES.SESSIONS, { keyPath: "id" });
          sessionStore.createIndex("startTime", "startTime", { unique: false });
        }

        // Activity - user activity logs
        if (!db.objectStoreNames.contains(STORES.ACTIVITY)) {
          const activityStore = db.createObjectStore(STORES.ACTIVITY, { keyPath: "id" });
          activityStore.createIndex("timestamp", "timestamp", { unique: false });
          activityStore.createIndex("type", "type", { unique: false });
        }

        // Settings - user preferences
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: "key" });
        }

        // Privacy rules
        if (!db.objectStoreNames.contains(STORES.RULES)) {
          db.createObjectStore(STORES.RULES, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        // Start hydration in background, don't await here to avoid deadlock
        this.hydrateIndex().catch(console.error);
        resolve(this.db);
      };
    });
  }

  private async hydrateIndex(): Promise<void> {
    if (this.isHydrated) return;
    try {
      // Use internal method that doesn't call ready()
      const embeddings = await this.internalGetAllEmbeddings();
      embeddings.forEach(({ nodeId, embedding }) => {
        this.annIndex.add(nodeId, embedding.vector);
      });
      this.isHydrated = true;
      console.log(`CortexStorage: Index hydrated with ${embeddings.length} nodes`);
    } catch (e) {
      console.error("CortexStorage: Index hydration failed", e);
    }
  }

  // Internal helper to bypass ready() check during hydration
  private async internalGetAllEmbeddings(): Promise<Array<{ nodeId: string; embedding: Embedding }>> {
    if (!this.db) throw new Error("DB not initialized");
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.EMBEDDINGS], "readonly");
      const store = transaction.objectStore(STORES.EMBEDDINGS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        resolve(
          results.map((r: any) => ({
            nodeId: r.nodeId,
            embedding: {
              vector: r.vector,
              model: r.model,
              timestamp: r.timestamp,
            },
          }))
        );
      };
      request.onerror = () => reject(new Error("Failed to get embeddings"));
    });
  }

  async ready(): Promise<void> {
    await this.initPromise;
  }

  // Memory Node Operations
  async addMemoryNode(node: MemoryNode): Promise<void> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PAGES], "readwrite");
      const store = transaction.objectStore(STORES.PAGES);
      const request = store.put(node);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to add memory node"));
    });
  }

  async getMemoryNode(id: string): Promise<MemoryNode | null> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PAGES], "readonly");
      const store = transaction.objectStore(STORES.PAGES);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error("Failed to get memory node"));
    });
  }

  async getAllMemoryNodes(limit?: number): Promise<MemoryNode[]> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PAGES], "readonly");
      const store = transaction.objectStore(STORES.PAGES);
      const index = store.index("timestamp");
      
      if (limit) {
        // Use cursor for limited results
        const request = index.openCursor(null, "prev"); // Descending order
        const results: MemoryNode[] = [];
        let count = 0;
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && count < limit) {
            results.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        
        request.onerror = () => reject(new Error("Failed to get memory nodes"));
      } else {
        // Without limit, use getAll() which returns an array directly
        const request = index.getAll();
        
        request.onsuccess = () => {
          const results = (request.result as MemoryNode[]) || [];
          resolve(results);
        };
        
        request.onerror = () => reject(new Error("Failed to get memory nodes"));
      }
    });
  }

  async searchMemoryNodes(query: string, limit: number = 10): Promise<MemoryNode[]> {
    // Simple text search - will be enhanced with vector search
    const allNodes = await this.getAllMemoryNodes();
    const queryTerms = query.toLowerCase().split(/\s+/);

    const scored = allNodes
      .map((node) => {
        const searchText = (node.title || "") + " " + (node.readableText || "") + " " + (node.keywords?.join(" ") || "");
        let score = 0;
        queryTerms.forEach((term) => {
          if (searchText.toLowerCase().includes(term)) {
            score += 1;
          }
        });
        return { node, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map((r) => r.node);
  }

  async deleteMemoryNode(id: string): Promise<void> {
    await this.ready();
    // Remove from ANN index
    this.annIndex.remove(id);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PAGES, STORES.EMBEDDINGS], "readwrite");
      const pageStore = transaction.objectStore(STORES.PAGES);
      const embeddingStore = transaction.objectStore(STORES.EMBEDDINGS);

      pageStore.delete(id);
      embeddingStore.delete(id);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error("Failed to delete memory node"));
    });
  }

  // Embedding Operations
  async storeEmbedding(nodeId: string, embedding: Embedding): Promise<void> {
    await this.ready();
    // Update ANN index
    this.annIndex.add(nodeId, embedding.vector);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.EMBEDDINGS], "readwrite");
      const store = transaction.objectStore(STORES.EMBEDDINGS);
      const request = store.put({ nodeId, ...embedding });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to store embedding"));
    });
  }

  async getEmbedding(nodeId: string): Promise<Embedding | null> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.EMBEDDINGS], "readonly");
      const store = transaction.objectStore(STORES.EMBEDDINGS);
      const request = store.get(nodeId);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }
        resolve({
          vector: result.vector,
          model: result.model,
          timestamp: result.timestamp,
        });
      };
      request.onerror = () => reject(new Error("Failed to get embedding"));
    });
  }

  async getAllEmbeddings(): Promise<Array<{ nodeId: string; embedding: Embedding }>> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.EMBEDDINGS], "readonly");
      const store = transaction.objectStore(STORES.EMBEDDINGS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        resolve(
          results.map((r: any) => ({
            nodeId: r.nodeId,
            embedding: {
              vector: r.vector,
              model: r.model,
              timestamp: r.timestamp,
            },
          }))
        );
      };
      request.onerror = () => reject(new Error("Failed to get embeddings"));
    });
  }

  // Vector Search
  async vectorSearch(
    queryVector: number[],
    limit: number = 10,
    threshold: number = 0.4
  ): Promise<SemanticMatch[]> {
    await this.ready();
    
    // Use ANN index for fast retrieval
    const candidateMatches = this.annIndex.search(queryVector, limit * 2, threshold);
    
    // Fetch nodes in parallel for speed
    const nodePromises = candidateMatches.map(({ nodeId }) => this.getMemoryNode(nodeId));
    const nodes = await Promise.all(nodePromises);
    
    const matches: SemanticMatch[] = candidateMatches
      .map(({ nodeId, similarity }, index) => {
        const node = nodes[index];
        if (!node) return null;
        return {
          nodeId,
          similarity,
          node,
          reason: {
            sharedKeywords: [],
            contextMatch: "",
            semanticSimilarity: similarity,
          },
        };
      })
      .filter((match): match is SemanticMatch => match !== null);

    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Cluster Operations
  async saveCluster(cluster: MemoryCluster): Promise<void> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CLUSTERS], "readwrite");
      const store = transaction.objectStore(STORES.CLUSTERS);
      const request = store.put(cluster);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to save cluster"));
    });
  }

  async getAllClusters(): Promise<MemoryCluster[]> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CLUSTERS], "readonly");
      const store = transaction.objectStore(STORES.CLUSTERS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error("Failed to get clusters"));
    });
  }

  // Graph Operations
  async addGraphEdge(fromNode: string, toNode: string, strength: number): Promise<void> {
    await this.ready();
    const edgeId = fromNode + ":" + toNode;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.GRAPH_EDGES], "readwrite");
      const store = transaction.objectStore(STORES.GRAPH_EDGES);
      const request = store.put({
        id: edgeId,
        fromNode,
        toNode,
        strength,
        timestamp: Date.now(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to add graph edge"));
    });
  }

  async getRelatedNodes(nodeId: string, limit: number = 5): Promise<MemoryNode[]> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.GRAPH_EDGES], "readonly");
      const store = transaction.objectStore(STORES.GRAPH_EDGES);
      const index = store.index("fromNode");
      const request = index.getAll(nodeId);

      request.onsuccess = async () => {
        const edges = request.result;
        const sorted = edges.sort((a: any, b: any) => b.strength - a.strength);
        const relatedIds = sorted.slice(0, limit).map((e: any) => e.toNode);
        const nodes = await Promise.all(
          relatedIds.map((id: string) => this.getMemoryNode(id))
        );
        resolve(nodes.filter((n): n is MemoryNode => n !== null));
      };
      request.onerror = () => reject(new Error("Failed to get related nodes"));
    });
  }

  // Settings Operations
  async updateSettings(settings: Partial<CaptureSettings>): Promise<void> {
    await this.ready();
    return new Promise(async (resolve, reject) => {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      
      const transaction = this.db!.transaction([STORES.SETTINGS], "readwrite");
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.put({ key: "capture", ...updated });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to update settings"));
    });
  }

  async getSettings(): Promise<CaptureSettings> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SETTINGS], "readonly");
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get("capture");

      request.onsuccess = () => {
        const defaultSettings: CaptureSettings = {
          enabled: true,
          excludeDomains: [],
          excludeKeywords: [],
          maxStorageSize: 500 * 1024 * 1024, // 500MB
        };
        resolve(request.result ? {
          enabled: request.result.enabled,
          excludeDomains: request.result.excludeDomains,
          excludeKeywords: request.result.excludeKeywords,
          maxStorageSize: request.result.maxStorageSize,
        } : defaultSettings);
      };
      request.onerror = () => reject(new Error("Failed to get settings"));
    });
  }

  // Agent Settings Operations
  async getAgentSettings(): Promise<AgentSettings> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SETTINGS], "readonly");
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get("agent");

      request.onsuccess = () => {
        const saved = request.result as any;
        if (!saved) {
          resolve(DEFAULT_AGENT_SETTINGS);
          return;
        }
        resolve({
          enabled: typeof saved.enabled === "boolean" ? saved.enabled : DEFAULT_AGENT_SETTINGS.enabled,
          dryRun: typeof saved.dryRun === "boolean" ? saved.dryRun : DEFAULT_AGENT_SETTINGS.dryRun,
          allowlistDomains: Array.isArray(saved.allowlistDomains) ? saved.allowlistDomains : DEFAULT_AGENT_SETTINGS.allowlistDomains,
          perStepTimeoutMs: typeof saved.perStepTimeoutMs === "number" ? saved.perStepTimeoutMs : DEFAULT_AGENT_SETTINGS.perStepTimeoutMs,
          retries: typeof saved.retries === "number" ? saved.retries : DEFAULT_AGENT_SETTINGS.retries,
          budgets: saved.budgets && typeof saved.budgets === "object" ? {
            maxDepth: typeof saved.budgets.maxDepth === "number" ? saved.budgets.maxDepth : DEFAULT_AGENT_SETTINGS.budgets.maxDepth,
            maxActions: typeof saved.budgets.maxActions === "number" ? saved.budgets.maxActions : DEFAULT_AGENT_SETTINGS.budgets.maxActions,
            navigationBudget: typeof saved.budgets.navigationBudget === "number" ? saved.budgets.navigationBudget : DEFAULT_AGENT_SETTINGS.budgets.navigationBudget,
            clickBudget: typeof saved.budgets.clickBudget === "number" ? saved.budgets.clickBudget : DEFAULT_AGENT_SETTINGS.budgets.clickBudget,
          } : DEFAULT_AGENT_SETTINGS.budgets,
          logDomTextMaxChars: typeof saved.logDomTextMaxChars === "number" ? saved.logDomTextMaxChars : DEFAULT_AGENT_SETTINGS.logDomTextMaxChars,
        });
      };
      request.onerror = () => reject(new Error("Failed to get agent settings"));
    });
  }

  async updateAgentSettings(settings: Partial<AgentSettings>): Promise<void> {
    await this.ready();
    return new Promise(async (resolve, reject) => {
      const current = await this.getAgentSettings();
      const updated: AgentSettings = {
        ...current,
        ...settings,
        budgets: { ...current.budgets, ...(settings.budgets || {}) },
      };

      const transaction = this.db!.transaction([STORES.SETTINGS], "readwrite");
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.put({ key: "agent", ...updated });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to update agent settings"));
    });
  }

  // Agent Logging (reuses ACTIVITY store)
  async addAgentLog(entry: AgentLogEntry): Promise<void> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.ACTIVITY], "readwrite");
      const store = transaction.objectStore(STORES.ACTIVITY);
      const request = store.put({
        id: entry.id,
        type: "agent_log",
        runId: entry.runId,
        level: entry.level,
        message: entry.message,
        timestamp: entry.timestamp,
        data: entry.data || {},
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to add agent log"));
    });
  }

  async getAgentLogs(runId?: string, limit: number = 200): Promise<AgentLogEntry[]> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.ACTIVITY], "readonly");
      const store = transaction.objectStore(STORES.ACTIVITY);
      const index = store.index("timestamp");
      const request = index.openCursor(null, "prev"); // newest first

      const results: AgentLogEntry[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null;
        if (!cursor) {
          resolve(results);
          return;
        }

        const value: any = cursor.value;
        if (value?.type === "agent_log") {
          if (!runId || value.runId === runId) {
            results.push({
              id: String(value.id),
              runId: String(value.runId),
              level: value.level,
              message: String(value.message),
              timestamp: Number(value.timestamp),
              data: value.data || {},
            });
          }
        }

        if (results.length >= limit) {
          resolve(results);
          return;
        }
        cursor.continue();
      };

      request.onerror = () => reject(new Error("Failed to get agent logs"));
    });
  }

  // Statistics
  async getStats(): Promise<{
    pageCount: number;
    clusterCount: number;
    edgeCount: number;
    storageSize: number;
  }> {
    await this.ready();
    
    // Execute all counts in parallel for speed
    const [pageCount, clusterCount, edgeCount] = await Promise.all([
      new Promise<number>((resolve, reject) => {
        const transaction = this.db!.transaction([STORES.PAGES], "readonly");
        const store = transaction.objectStore(STORES.PAGES);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error("Failed to count pages"));
      }),
      new Promise<number>((resolve, reject) => {
        const transaction = this.db!.transaction([STORES.CLUSTERS], "readonly");
        const store = transaction.objectStore(STORES.CLUSTERS);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error("Failed to count clusters"));
      }),
      new Promise<number>((resolve, reject) => {
        const transaction = this.db!.transaction([STORES.GRAPH_EDGES], "readonly");
        const store = transaction.objectStore(STORES.GRAPH_EDGES);
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error("Failed to count edges"));
      }),
    ]);

    // Get storage size estimate (non-blocking)
    let storageSize = 0;
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        storageSize = estimate.usage || 0;
      } catch (e) {
        // Ignore storage estimate errors
      }
    }

    return { pageCount, clusterCount, edgeCount, storageSize };
  }

  // Cleanup operations
  async deleteByDomain(domain: string): Promise<number> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PAGES, STORES.EMBEDDINGS], "readwrite");
      const pageStore = transaction.objectStore(STORES.PAGES);
      const embeddingStore = transaction.objectStore(STORES.EMBEDDINGS);
      const index = pageStore.index("domain");
      const request = index.openCursor(IDBKeyRange.only(domain));
      
      let count = 0;
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const id = cursor.value.id;
          pageStore.delete(id);
          embeddingStore.delete(id);
          this.annIndex.remove(id);
          count++;
          cursor.continue();
        } else {
          resolve(count);
        }
      };
      request.onerror = () => reject(new Error("Failed to delete by domain"));
    });
  }

  async deleteByDateRange(startDate: number, endDate: number): Promise<number> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PAGES, STORES.EMBEDDINGS], "readwrite");
      const pageStore = transaction.objectStore(STORES.PAGES);
      const embeddingStore = transaction.objectStore(STORES.EMBEDDINGS);
      const index = pageStore.index("timestamp");
      const request = index.openCursor(IDBKeyRange.bound(startDate, endDate));
      
      let count = 0;
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const id = cursor.value.id;
          pageStore.delete(id);
          embeddingStore.delete(id);
          this.annIndex.remove(id);
          count++;
          cursor.continue();
        } else {
          resolve(count);
        }
      };
      request.onerror = () => reject(new Error("Failed to delete by date range"));
    });
  }

  async clearAllData(): Promise<void> {
    await this.ready();
    // Clear ANN index
    this.annIndex.clear();
    
    return new Promise((resolve, reject) => {
      const storeNames = Object.values(STORES);
      const transaction = this.db!.transaction(storeNames, "readwrite");
      for (const storeName of storeNames) {
        transaction.objectStore(storeName as any).clear();
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error("Failed to clear all data"));
    });
  }

  // Privacy Rule Operations
  async addPrivacyRule(rule: PrivacyRule): Promise<void> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.RULES], "readwrite");
      const store = transaction.objectStore(STORES.RULES);
      const request = store.put(rule);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to add privacy rule"));
    });
  }

  async getPrivacyRules(): Promise<PrivacyRule[]> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.RULES], "readonly");
      const store = transaction.objectStore(STORES.RULES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error("Failed to get privacy rules"));
    });
  }

  async deletePrivacyRule(id: string): Promise<void> {
    await this.ready();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.RULES], "readwrite");
      const store = transaction.objectStore(STORES.RULES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error("Failed to delete privacy rule"));
    });
  }
}

// Singleton instance
export const cortexStorage = new CortexStorage();
