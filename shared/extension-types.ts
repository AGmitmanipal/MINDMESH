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
    agent?: {
      runId: string;
      step: number;
      actionType?: string;
      actionId?: string;
    };
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

/**
 * Autonomous browsing / agent types
 */
export type AgentActionType =
  | "open_tab"
  | "navigate"
  | "click"
  | "type"
  | "fill_form"
  | "wait_for_selector"
  | "wait_for_navigation"
  | "extract_dom";

export interface AgentAction {
  id: string;
  type: AgentActionType;
  data: Record<string, unknown>;
}

export interface AgentPageLink {
  href: string;
  text: string;
  selector?: string;
}

export interface AgentDomSnapshot {
  url: string;
  title: string;
  metaDescription?: string;
  snippet?: string;
  mainText: string;
  headings?: string[];
  links?: AgentPageLink[];
  capturedAt: number;
}

export interface AgentObservation {
  snapshot?: AgentDomSnapshot;
  jsErrors?: Array<{
    message: string;
    source?: string;
    lineno?: number;
    colno?: number;
    timestamp: number;
  }>;
}

export interface AgentBudgets {
  maxDepth: number;
  maxActions: number;
  navigationBudget: number;
  clickBudget: number;
}

export interface AgentSettings {
  enabled: boolean;
  dryRun: boolean;
  allowlistDomains: string[]; // If empty, allow all (still subject to extension's privacy/capture settings)
  perStepTimeoutMs: number;
  retries: number;
  budgets: AgentBudgets;
  logDomTextMaxChars: number; // safety / storage guardrail
}

export type AgentRunState = "idle" | "planning" | "acting" | "observing" | "stopped" | "completed" | "error";

export interface AgentRunStatus {
  runId: string | null;
  state: AgentRunState;
  goal?: string;
  startedAt?: number;
  updatedAt?: number;
  tabId?: number;
  depth?: number;
  actionsTaken?: number;
  navigations?: number;
  clicks?: number;
  lastError?: string;
}

export type AgentLogLevel = "debug" | "info" | "warn" | "error";

export interface AgentLogEntry {
  id: string;
  runId: string;
  level: AgentLogLevel;
  message: string;
  timestamp: number;
  data?: Record<string, unknown>;
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
    }
  | {
      type: "GET_AGENT_SETTINGS";
      payload?: Record<string, never>;
    }
  | {
      type: "UPDATE_AGENT_SETTINGS";
      payload: Partial<AgentSettings>;
    }
  | {
      type: "GET_AGENT_STATUS";
      payload?: Record<string, never>;
    }
  | {
      type: "GET_AGENT_LOGS";
      payload: { runId?: string; limit?: number };
    }
  | {
      type: "START_AUTONOMOUS_BROWSING";
      payload: { goal: string; startUrl?: string; tabId?: number };
    }
  | {
      type: "STOP_AUTONOMOUS_BROWSING";
      payload?: { runId?: string };
    }
  | {
      type: "AGENT_JS_ERROR";
      payload: {
        message: string;
        source?: string;
        lineno?: number;
        colno?: number;
        timestamp: number;
        url?: string;
      };
    };
