/**
 * Shared types for Cortex browser extension + web dashboard
 * All communication between extension and web pages uses these types
 */

export interface PageContext {
  url: string;
  title: string;
  readableText: string;
  timestamp: number;
  tabId?: number;
  sessionId?: string;
  favicon?: string;
  metadata?: {
    domain: string;
  };
}

export interface Embedding {
  vector: number[];
  model: "onnx-sentence" | "ggml" | "wasm" | "fallback";
  timestamp: number;
}

export interface MemoryNode {
  id: string;
  url: string;
  title: string;
  readableText: string;
  summary?: string;
  timestamp: number;
  embedding?: Embedding;
  keywords: string[];
  metadata: {
    domain: string;
    favicon?: string;
    tabId?: number;
    sessionId?: string;
  };
}

export interface SemanticMatch {
  nodeId: string;
  similarity: number;
  node: MemoryNode;
  reason: {
    sharedKeywords: string[];
    contextMatch: string;
    semanticSimilarity: number;
  };
}

export interface MemoryCluster {
  id: string;
  name: string;
  color: string;
  nodes: MemoryNode[];
  centroid?: number[];
  keywords: string[];
}

export interface CaptureSettings {
  enabled: boolean;
  excludeDomains: string[];
  excludeKeywords: string[];
  maxStorageSize: number;
}

export interface PrivacyRule {
  id: string;
  type: "domain" | "date" | "keyword";
  value: string;
  status: "active" | "inactive";
  createdAt: string;
}

// Message types for extension communication
export type ExtensionMessage =
  | {
      type: "PING";
      payload?: Record<string, never>;
    }
  | {
      type: "PAGE_CAPTURED";
      payload: PageContext;
    }
  | {
      type: "GET_ALL_PAGES";
      payload: { limit?: number };
    }
  | {
      type: "GET_STATS";
      payload: Record<string, never>;
    }
  | {
      type: "SEARCH_MEMORY";
      payload: {
        query: string;
        limit?: number;
      };
    }
  | {
      type: "GET_SUGGESTIONS";
      payload: {
        currentUrl: string;
        limit?: number;
      };
    }
  | {
      type: "GET_PRIVACY_RULES";
      payload: Record<string, never>;
    }
  | {
      type: "ADD_PRIVACY_RULE";
      payload: PrivacyRule;
    }
  | {
      type: "DELETE_PRIVACY_RULE";
      payload: { id: string };
    }
  | {
      type: "FORGET_DATA";
      payload: {
        ruleId?: string;
        domain?: string;
        startDate?: number;
        endDate?: number;
      };
    }
  | {
      type: "EXPORT_MEMORY";
      payload: Record<string, never>;
    }
  | {
      type: "UPDATE_CAPTURE_SETTINGS";
      payload: Partial<CaptureSettings>;
    }
  | {
      type: "GET_CAPTURE_SETTINGS";
      payload?: Record<string, never>;
    }
  | {
      type: "GET_ACTIVITY_INSIGHTS";
      payload: Record<string, never>;
    }
  | {
      type: "GET_SHORTCUTS";
      payload: Record<string, never>;
    }
  | {
      type: "EXECUTE_ACTION";
      payload: {
        action: {
          type: "open_tab" | "close_tab" | "navigate" | "fill_form" | "click" | "extract";
          data: Record<string, unknown>;
        };
      };
    };
