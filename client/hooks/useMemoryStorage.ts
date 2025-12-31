import { useEffect, useState, useCallback } from "react";
import type { MemoryNode, PrivacyRule } from "@shared/extension-types";

const DB_NAME = "cortex-memory";
const DB_VERSION = 2; // Matched with extension version

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

interface UseMemoryStorageReturn {
  isReady: boolean;
  addPage: (page: MemoryNode) => Promise<string>;
  searchPages: (query: string, limit?: number) => Promise<MemoryNode[]>;
  getPagesByDomain: (domain: string) => Promise<MemoryNode[]>;
  deletePagesByDomain: (domain: string) => Promise<number>;
  deletePagesByDateRange: (startDate: number, endDate: number) => Promise<number>;
  exportMemory: () => Promise<MemoryNode[]>;
  getAllPages: () => Promise<MemoryNode[]>;
  getPageCount: () => Promise<number>;
  getStorageSize: () => Promise<number>;
  addPrivacyRule: (rule: PrivacyRule) => Promise<string>;
  getPrivacyRules: () => Promise<PrivacyRule[]>;
  deletePrivacyRule: (ruleId: string) => Promise<void>;
  error: Error | null;
}

export function useMemoryStorage(): UseMemoryStorageReturn {
  const [isReady, setIsReady] = useState(false);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          setError(new Error("Failed to open IndexedDB"));
        };

        request.onupgradeneeded = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;

          // Pages store - main memory nodes
          if (!database.objectStoreNames.contains(STORES.PAGES)) {
            const pageStore = database.createObjectStore(STORES.PAGES, { keyPath: "id" });
            pageStore.createIndex("url", "url", { unique: false });
            pageStore.createIndex("domain", "metadata.domain", { unique: false });
            pageStore.createIndex("timestamp", "timestamp", { unique: false });
            pageStore.createIndex("sessionId", "metadata.sessionId", { unique: false });
          }

          // Embeddings store
          if (!database.objectStoreNames.contains(STORES.EMBEDDINGS)) {
            database.createObjectStore(STORES.EMBEDDINGS, { keyPath: "nodeId" });
          }

          // Clusters store
          if (!database.objectStoreNames.contains(STORES.CLUSTERS)) {
            database.createObjectStore(STORES.CLUSTERS, { keyPath: "id" });
          }

          // Graph edges
          if (!database.objectStoreNames.contains(STORES.GRAPH_EDGES)) {
            const edgeStore = database.createObjectStore(STORES.GRAPH_EDGES, { keyPath: "id" });
            edgeStore.createIndex("fromNode", "fromNode", { unique: false });
          }

          // Sessions
          if (!database.objectStoreNames.contains(STORES.SESSIONS)) {
            database.createObjectStore(STORES.SESSIONS, { keyPath: "id" });
          }

          // Activity
          if (!database.objectStoreNames.contains(STORES.ACTIVITY)) {
            database.createObjectStore(STORES.ACTIVITY, { keyPath: "id" });
          }

          // Settings
          if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
            database.createObjectStore(STORES.SETTINGS, { keyPath: "key" });
          }

          // Rules
          if (!database.objectStoreNames.contains(STORES.RULES)) {
            database.createObjectStore(STORES.RULES, { keyPath: "id" });
          }
        };

        request.onsuccess = () => {
          const database = request.result;
          setDb(database);
          setIsReady(true);
        };
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error initializing DB")
        );
      }
    };

    initDB();

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  const addPage = useCallback(
    async (page: MemoryNode): Promise<string> => {
      if (!db) throw new Error("Database not ready");

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PAGES], "readwrite");
        const store = transaction.objectStore(STORES.PAGES);
        const request = store.put(page); // Use put instead of add to handle updates

        request.onsuccess = () => {
          resolve(request.result as string);
        };

        request.onerror = () => {
          reject(new Error("Failed to add page to memory"));
        };
      });
    },
    [db]
  );

  const getAllPages = useCallback(async (): Promise<MemoryNode[]> => {
    if (!db) throw new Error("Database not ready");

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PAGES], "readonly");
      const store = transaction.objectStore(STORES.PAGES);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as MemoryNode[];
        // Sort by timestamp descending
        resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };

      request.onerror = () => {
        reject(new Error("Failed to retrieve pages"));
      };
    });
  }, [db]);

  const searchPages = useCallback(
    async (query: string, limit: number = 10): Promise<MemoryNode[]> => {
      if (!db) throw new Error("Database not ready");

      const allPages = await getAllPages();

      if (!query.trim()) return allPages.slice(0, limit);

      // Simple text-based search
      const queryTerms = query.toLowerCase().split(/\s+/);
      const scored = allPages
        .map((page) => {
          let score = 0;
          const textToSearch = `${page.title} ${page.readableText} ${page.keywords.join(" ")}`.toLowerCase();

          queryTerms.forEach((term) => {
            if (textToSearch.includes(term)) {
              score += 1;
            }
          });

          return { page, score };
        })
        .filter((result) => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return scored.map((result) => result.page);
    },
    [db, getAllPages]
  );

  const getPagesByDomain = useCallback(
    async (domain: string): Promise<MemoryNode[]> => {
      if (!db) throw new Error("Database not ready");

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PAGES], "readonly");
        const store = transaction.objectStore(STORES.PAGES);
        const index = store.index("domain");
        const request = index.getAll(domain);

        request.onsuccess = () => {
          resolve(request.result as MemoryNode[]);
        };

        request.onerror = () => {
          reject(new Error("Failed to retrieve pages by domain"));
        };
      });
    },
    [db]
  );

  const deletePagesByDomain = useCallback(
    async (domain: string): Promise<number> => {
      if (!db) throw new Error("Database not ready");

      const pages = await getPagesByDomain(domain);

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PAGES], "readwrite");
        const store = transaction.objectStore(STORES.PAGES);
        let deleted = 0;

        pages.forEach((page) => {
          const request = store.delete(page.id);
          request.onsuccess = () => {
            deleted++;
          };
        });

        transaction.oncomplete = () => {
          resolve(deleted);
        };

        transaction.onerror = () => {
          reject(new Error("Failed to delete pages"));
        };
      });
    },
    [db, getPagesByDomain]
  );

  const deletePagesByDateRange = useCallback(
    async (startDate: number, endDate: number): Promise<number> => {
      if (!db) throw new Error("Database not ready");

      const allPages = await getAllPages();
      const pagesToDelete = allPages.filter(
        (page) => page.timestamp >= startDate && page.timestamp <= endDate
      );

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.PAGES], "readwrite");
        const store = transaction.objectStore(STORES.PAGES);
        let deleted = 0;

        pagesToDelete.forEach((page) => {
          const request = store.delete(page.id);
          request.onsuccess = () => {
            deleted++;
          };
        });

        transaction.oncomplete = () => {
          resolve(deleted);
        };

        transaction.onerror = () => {
          reject(new Error("Failed to delete pages"));
        };
      });
    },
    [db, getAllPages]
  );

  const exportMemory = useCallback(async (): Promise<MemoryNode[]> => {
    return getAllPages();
  }, [getAllPages]);

  const getPageCount = useCallback(async (): Promise<number> => {
    if (!db) throw new Error("Database not ready");

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PAGES], "readonly");
      const store = transaction.objectStore(STORES.PAGES);
      const request = store.count();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error("Failed to count pages"));
      };
    });
  }, [db]);

  const getStorageSize = useCallback(async (): Promise<number> => {
    if (!navigator.storage?.estimate) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch {
      return 0;
    }
  }, []);

  const addPrivacyRule = useCallback(
    async (rule: PrivacyRule): Promise<string> => {
      if (!db) throw new Error("Database not ready");

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.RULES], "readwrite");
        const store = transaction.objectStore(STORES.RULES);
        const request = store.put(rule);

        request.onsuccess = () => {
          resolve(request.result as string);
        };

        request.onerror = () => {
          reject(new Error("Failed to add privacy rule"));
        };
      });
    },
    [db]
  );

  const getPrivacyRules = useCallback(async (): Promise<PrivacyRule[]> => {
    if (!db) throw new Error("Database not ready");

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.RULES], "readonly");
      const store = transaction.objectStore(STORES.RULES);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as PrivacyRule[]);
      };

      request.onerror = () => {
        reject(new Error("Failed to retrieve privacy rules"));
      };
    });
  }, [db]);

  const deletePrivacyRule = useCallback(
    async (ruleId: string): Promise<void> => {
      if (!db) throw new Error("Database not ready");

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORES.RULES], "readwrite");
        const store = transaction.objectStore(STORES.RULES);
        const request = store.delete(ruleId);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          reject(new Error("Failed to delete privacy rule"));
        };
      });
    },
    [db]
  );

  return {
    isReady,
    addPage,
    searchPages,
    getPagesByDomain,
    deletePagesByDomain,
    deletePagesByDateRange,
    exportMemory,
    getAllPages,
    getPageCount,
    getStorageSize,
    addPrivacyRule,
    getPrivacyRules,
    deletePrivacyRule,
    error,
  };
}
