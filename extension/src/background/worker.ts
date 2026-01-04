/**
 * Cortex Background Worker
 * 
 * Handles message routing, storage coordination, and background services.
 * Prevents duplicate captures within same browsing session.
 */

import { cortexStorage } from "../utils/storage";
import { recallService } from "../services/recall-service";
import { proactivityEngine } from "../services/proactivity-engine";
import { activityInsightsService } from "../services/activity-insights";
import { analyticsService } from "../services/analytics-service";
import { shortcutGenerator } from "../services/shortcut-generator";
import { actionExecutor } from "../services/action-executor";
import { semanticGraphBuilder } from "../utils/semantic-graph";
import { generateEmbedding } from "../utils/embedding";
import { extractKeywords } from "@/lib/text-utils";
import type { ExtensionMessage, MemoryNode, CaptureSettings } from "@shared/extension-types";
import seedMemories from "../data/seed-memories.json";

// Track captured URLs in current session to prevent duplicates
const sessionCaptured = new Map<string, number>(); // URL -> timestamp

// Ensure storage is ready before handling messages
let storageReady = false;
let seedingComplete = false;

cortexStorage.ready().then(async () => {
  storageReady = true;
  console.log("Cortex: Storage initialized and ready");
  // Always upsert seed memories on startup (best-effort). This keeps a baseline dataset visible.
  try {
    await seedAlways();
    seedingComplete = true;
    console.log("Cortex: Seed memories completed");
  } catch (e) {
    console.warn("Cortex: Seed memories failed", e);
    seedingComplete = true; // Mark complete even if it fails so messages can be processed
  }
}).catch(err => {
  console.error("Cortex: Storage initialization failed", err);
});

async function seedAlways(): Promise<void> {
  try {
    const items = (seedMemories as any[]) || [];
    if (items.length === 0) {
      console.warn("Cortex: seedAlways: No seed memories found in JSON");
      return;
    }

    const baseNow = Date.now();
    console.log(`Cortex: Upserting ${items.length} seed memory nodes`);

    // Make seed nodes appear near the top by refreshing their timestamps each startup.
    // This does NOT delete user data; it only overwrites seed_* ids.
    for (let i = 0; i < items.length; i++) {
      const raw = items[i];
      try {
        const node: MemoryNode = {
          id: String(raw.id),
          url: String(raw.url),
          title: String(raw.title),
          readableText: String(raw.readableText || ""),
          timestamp: baseNow - (items.length - i) * 1000,
          keywords: Array.isArray(raw.keywords) ? raw.keywords.map(String) : extractKeywords(String(raw.readableText || ""), String(raw.title || "")),
          metadata: {
            domain: String(raw.metadata?.domain || ""),
            favicon: String(raw.metadata?.favicon || ""),
            sessionId: String(raw.metadata?.sessionId || "seed"),
          },
        };

        const embeddingResult = generateEmbedding(node.readableText, node.title, node.keywords);
        node.embedding = { vector: embeddingResult.vector, model: embeddingResult.model, timestamp: baseNow };

        await Promise.all([cortexStorage.addMemoryNode(node), cortexStorage.storeEmbedding(node.id, node.embedding)]);
        semanticGraphBuilder.addNode(node, node.embedding).catch(console.error);
        console.log(`Cortex: Seeded memory ${i + 1}/${items.length}: ${node.title}`);
      } catch (nodeError) {
        console.error(`Cortex: Failed to seed memory ${i + 1}/${items.length}:`, nodeError);
      }
    }

    const stats = await cortexStorage.getStats();
    console.log(`Cortex: Seed memories loaded. Total pages: ${stats.pageCount}`);
  } catch (e) {
    // Log full error for debugging
    console.error("Cortex: seedAlways error:", e);
    if (e instanceof Error) {
      console.error("Cortex: seedAlways error stack:", e.stack);
    }
  }
}

// Log initialization
console.log("Cortex: Background worker script loaded");

/**
 * Clear old session entries (older than 30 minutes)
 */
function cleanSessionCache() {
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  for (const [url, timestamp] of sessionCaptured.entries()) {
    if (now - timestamp > thirtyMinutes) {
      sessionCaptured.delete(url);
    }
  }
}

// Clean cache every 5 minutes
setInterval(cleanSessionCache, 5 * 60 * 1000);

/**
 * Handle messages from content scripts and dashboard
 */
const messageHandler = (message: ExtensionMessage, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  console.log("Cortex: Received message", message.type, "from", sender.url || "internal");

  const handleMessage = async () => {
    // Ensure storage is ready for all operations - wait if necessary
    if (!storageReady) {
      try {
        await cortexStorage.ready();
        storageReady = true;
        console.log("Cortex: Storage ready, processing message");
      } catch (err) {
        console.error("Cortex: Failed to initialize storage", err);
        return { success: false, error: "Storage initialization failed" };
      }
    }
    
    // Additional check: wait for seeding on first critical operations
    const seedWaitOperations = ["GET_ALL_PAGES", "GET_STATS", "GET_ANALYTICS"];
    if (seedWaitOperations.includes(message.type) && !seedingComplete) {
      console.log(`Cortex: ${message.type} waiting for seeding...`);
      let waitCount = 0;
      while (!seedingComplete && waitCount < 50) { // 5 seconds max
        await new Promise(r => setTimeout(r, 100));
        waitCount++;
      }
    }

    try {
      switch (message.type) {
        case "SEED_MEMORIES": {
          await seedAlways();
          const stats = await cortexStorage.getStats();
          return { success: true, data: { pageCount: stats.pageCount } };
        }

        case "PING": {
          return { success: true, version: "0.1.0" };
        }

        case "PAGE_CAPTURED": {
          const [settings, privacyRules] = await Promise.all([
            cortexStorage.getSettings(),
            cortexStorage.getPrivacyRules()
          ]);

          if (!settings.enabled) {
            console.log("Cortex: Capture skipped (disabled in settings)");
            return { success: true, skipped: true, reason: "disabled" };
          }

          const { payload } = message;
          const url = payload.url;

          try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            const fullText = (payload.title + " " + payload.readableText).toLowerCase();

            // 1. Check domain exclusion in settings
            if (settings.excludeDomains.some(d => hostname.includes(d.toLowerCase()))) {
              console.log("Cortex: Capture skipped (domain excluded in settings)");
              return { success: true, skipped: true, reason: "excluded_domain" };
            }

            // 2. Check individual privacy rules
            for (const rule of privacyRules) {
              if (rule.status !== "active") continue;

              if (rule.type === "domain" && hostname.includes(rule.value.toLowerCase())) {
                console.log("Cortex: Capture skipped (matched privacy rule: domain)");
                return { success: true, skipped: true, reason: "privacy_rule_domain" };
              }

              if (rule.type === "keyword" && fullText.includes(rule.value.toLowerCase())) {
                console.log("Cortex: Capture skipped (matched privacy rule: keyword)");
                return { success: true, skipped: true, reason: "privacy_rule_keyword" };
              }
            }

            const isRefresh = (payload as any).isRefresh || false;
            
            // Generate URL-based ID
            const urlHash = url.split('').reduce((hash, char) => {
              return ((hash << 5) - hash) + char.charCodeAt(0);
            }, 0);
            const nodeId = `page_${Math.abs(urlHash).toString(36)}`;
            
            // Check if already captured in this session (unless it's a refresh)
            const lastCaptured = sessionCaptured.get(url);
            const now = Date.now();
            
            if (!isRefresh && lastCaptured && (now - lastCaptured < 30000)) {
              return { success: true, nodeId, skipped: true };
            }
            
            // Start processing but don't wait for everything to respond
            // This makes the UI feel much faster
            const processCapture = async () => {
              const keywords = extractKeywords(payload.readableText, payload.title);
              const embeddingResult = generateEmbedding(payload.readableText, payload.title, keywords);

              const node: MemoryNode = {
                id: nodeId,
                url: payload.url,
                title: payload.title,
                readableText: payload.readableText,
                timestamp: now,
                keywords: keywords,
                embedding: {
                  vector: embeddingResult.vector,
                  model: "fallback",
                  timestamp: now
                },
                metadata: {
                  domain: hostname,
                  favicon: payload.favicon,
                  tabId: sender.tab?.id,
                  sessionId: (payload as any).sessionId,
                },
              };

              await Promise.all([
                cortexStorage.addMemoryNode(node),
                cortexStorage.storeEmbedding(nodeId, node.embedding!)
              ]);
              
              sessionCaptured.set(url, now);
              semanticGraphBuilder.addNode(node, node.embedding!).catch(console.error);
              console.log("Cortex: Capture complete for", url);
            };

            // Run in background
            processCapture().catch(err => console.error("Cortex: Background capture failed", err));
            
            return { success: true, nodeId, status: "processing" };
          } catch (urlError) {
            return { success: false, error: String(urlError) };
          }
        }

        case "GET_ALL_PAGES": {
          
          const pages = await cortexStorage.getAllMemoryNodes(message.payload.limit);
          // Only send what's needed for the dashboard list to save bandwidth and speed up communication
          const minimalPages = pages.map(page => ({
            id: page.id,
            url: page.url,
            title: page.title,
            timestamp: page.timestamp,
            keywords: page.keywords,
            metadata: page.metadata,
            // Include only a snippet for the list view
            snippet: page.readableText ? page.readableText.slice(0, 300) : ""
          }));
          console.log("Cortex: GET_ALL_PAGES returning", minimalPages.length, "pages (minimal)");
          return { success: true, data: minimalPages };
        }

        case "GET_STATS": {
          
          const stats = await cortexStorage.getStats();
          console.log("Cortex: GET_STATS returning", stats);
          return { success: true, data: stats };
        }

        case "SEARCH_MEMORY": {
          try {
            console.log("Cortex: Starting SEARCH_MEMORY for query:", message.payload.query);
            const results = await recallService.search(message.payload.query, message.payload.limit || 20);
            console.log("Cortex: SEARCH_MEMORY completed, returning", results.totalResults, "results");
            return { success: true, data: results };
          } catch (error) {
            console.error("Cortex: SEARCH_MEMORY error:", error);
            return { 
              success: false, 
              error: String(error),
              data: { 
                matches: [], 
                query: message.payload.query || "", 
                timestamp: Date.now(), 
                totalResults: 0 
              }
            };
          }
        }

        case "GET_SUGGESTIONS": {
          const suggestions = await proactivityEngine.generateSuggestions(message.payload.currentUrl, message.payload.limit);
          return { success: true, data: suggestions };
        }

        case "FORGET_DATA": {
          const { domain, startDate, endDate } = message.payload;
          let count = 0;
          if (domain) {
            count = await cortexStorage.deleteByDomain(domain);
          } else if (startDate && endDate) {
            count = await cortexStorage.deleteByDateRange(startDate, endDate);
          } else {
            // If no parameters, clear everything
            await cortexStorage.clearAllData();
            sessionCaptured.clear();
            return { success: true, count: -1 }; // -1 indicates all cleared
          }
          return { success: true, count };
        }

        case "GET_ACTIVITY_INSIGHTS": {
          const insights = await activityInsightsService.getActivityStats();
          return { success: true, data: insights };
        }

        case "GET_ANALYTICS": {
          try {
            console.log("Cortex: Starting GET_ANALYTICS");
            const analytics = await analyticsService.getAnalytics();
            console.log("Cortex: GET_ANALYTICS completed, totalPages:", analytics.totalPages);
            return { success: true, data: analytics };
          } catch (error) {
            console.error("Cortex: GET_ANALYTICS error:", error);
            return { 
              success: false, 
              error: String(error),
              data: {
                daily: [],
                monthly: [],
                yearly: [],
                topSites: [],
                topCategories: [],
                totalPages: 0,
                uniqueDomains: 0,
                dateRange: { start: Date.now(), end: Date.now() }
              }
            };
          }
        }

        case "GET_PRIVACY_RULES": {
          const rules = await cortexStorage.getPrivacyRules();
          return { success: true, data: rules };
        }

        case "ADD_PRIVACY_RULE": {
          await cortexStorage.addPrivacyRule(message.payload);
          return { success: true };
        }

        case "DELETE_PRIVACY_RULE": {
          await cortexStorage.deletePrivacyRule(message.payload.id);
          return { success: true };
        }

        case "UPDATE_CAPTURE_SETTINGS": {
          await cortexStorage.updateSettings(message.payload);
          return { success: true };
        }

        case "GET_CAPTURE_SETTINGS": {
          const settings = await cortexStorage.getSettings();
          return { success: true, data: settings };
        }

        case "GET_SHORTCUTS": {
          const shortcuts = await shortcutGenerator.generateShortcuts();
          return { success: true, data: shortcuts };
        }

        case "EXECUTE_ACTION": {
          const result = await actionExecutor.execute(message.payload.action);
          return { success: true, data: result };
        }

        default:
          return { success: false, error: "Unknown message type" };
      }
    } catch (error) {
      console.error(`Cortex: Error handling message ${message.type}:`, error);
      return { success: false, error: String(error) };
    }
  };

  handleMessage().then(sendResponse).catch(err => {
    console.error("Cortex: Fatal error in message handler:", err);
    sendResponse({ success: false, error: "Internal extension error" });
  });
  return true; // Keep channel open for async response
};

// Listen for internal messages (popup, content scripts)
chrome.runtime.onMessage.addListener(messageHandler);

// Listen for external messages (web dashboard)
chrome.runtime.onMessageExternal.addListener(messageHandler);

console.log("Cortex background worker initialized with session-based deduplication");
