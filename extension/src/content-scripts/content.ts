/**
 * Cortex Content Script
 * 
 * Injected into every page the user visits.
 * Captures page content and sends it to the background service worker.
 * Only captures on initial visit or explicit refresh.
 */

import type { PageContext } from "@shared/extension-types";
import { extractReadableText, extractKeywords, getFaviconUrl, getDomain } from "@/lib/text-utils";

/**
 * Check if current page should be captured
 */
function shouldCapturePage(): boolean {
  const url = window.location.href;
  const hostname = window.location.hostname;
  
  // Don't capture extension pages
  if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) {
    console.log("Cortex: Skipping chrome:// page");
    return false;
  }
  
  // Don't capture localhost pages if they are the dashboard
  if ((hostname === "localhost" || hostname === "127.0.0.1") && window.location.port === "8080") {
    console.log("Cortex: Skipping dashboard page on localhost");
    return false;
  }
  
  // Allow other localhost pages (like user's other dev projects)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    console.log("Cortex: Capturing localhost page (not dashboard)");
    return true;
  }
  
  // Don't capture new tab pages, blank pages, etc.
  if (url === "about:blank" || url === "about:newtab" || url.startsWith("about:")) {
    console.log("Cortex: Skipping about: page");
    return false;
  }
  
  // Don't capture file:// pages
  if (url.startsWith("file://")) {
    console.log("Cortex: Skipping file:// page");
    return false;
  }
  
  return true;
}

/**
 * Extract relevant page information
 */
function capturePageContext(): PageContext {
  try {
    const htmlContent = document.documentElement?.outerHTML || "";
    const readableText = extractReadableText(htmlContent);
    const title = document.title || "Untitled Page";
    const keywords = extractKeywords(readableText, title);

    return {
      url: window.location.href,
      title: document.title || "Untitled Page",
      readableText: readableText || "",
      timestamp: Date.now(),
      favicon: getFaviconUrl(window.location.href),
      metadata: {
        domain: getDomain(window.location.href),
      },
    };
  } catch (err) {
    console.error("Cortex: Error extracting page context", err);
    // Return minimal context on error
    return {
      url: window.location.href,
      title: document.title || "Untitled Page",
      readableText: "",
      timestamp: Date.now(),
      favicon: getFaviconUrl(window.location.href),
      metadata: {
        domain: getDomain(window.location.href),
      },
    };
  }
}

/**
 * Send page capture to background worker
 */
function sendPageCapture(pageContext: PageContext, isRefresh: boolean = false, retryCount: number = 0) {
  chrome.runtime.sendMessage(
    {
      type: "PAGE_CAPTURED",
      payload: { ...pageContext, isRefresh },
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("Cortex: Failed to send page capture", chrome.runtime.lastError);
        // Retry once after 1 second if first attempt fails
        if (retryCount === 0) {
          setTimeout(() => {
            sendPageCapture(pageContext, isRefresh, 1);
          }, 1000);
        }
      } else if (response && response.success) {
        console.log("Cortex: Page captured successfully -", pageContext.title, isRefresh ? "(refresh)" : "(new)");
      } else {
        console.warn("Cortex: Page capture returned unexpected response:", response);
      }
    }
  );
}

/**
 * Check if this is a page refresh vs new navigation
 */
function isPageRefresh(): boolean {
  // Check if navigation type is reload
  const perfEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  if (perfEntries.length > 0) {
    return perfEntries[0].type === "reload";
  }
  
  // Fallback: check performance.navigation (deprecated but widely supported)
  if ((performance as any).navigation) {
    return (performance as any).navigation.type === 1; // TYPE_RELOAD
  }
  
  return false;
}

/**
 * Initialize content script
 */
function init() {
  // 1. Set ID on the window for immediate access (isolated world)
  (window as any).CORTEX_EXTENSION_ID = chrome.runtime.id;

  // 2. Dispatch event for pages already listening
  window.dispatchEvent(new CustomEvent("cortex-extension-ready", {
    detail: { id: chrome.runtime.id }
  }));
  
  // 3. Listen for requests from the webpage (handshake)
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data?.type === "CORTEX_QUERY_EXTENSION") {
      window.postMessage({ 
        type: "CORTEX_ID_RESPONSE", 
        id: chrome.runtime.id 
      }, "*");
    }
  });

  console.log("Cortex: Extension content script initialized, ID:", chrome.runtime.id);

  // Check if we should capture this page
  if (!shouldCapturePage()) {
    return;
  }

  // Generate session ID (persist across page navigations)
  let sessionId = sessionStorage.getItem("cortex_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("cortex_session_id", sessionId);
  }

  // Determine if this is a refresh or new visit
  const isRefresh = isPageRefresh();
  
  console.log("Cortex: Page load detected -", isRefresh ? "REFRESH" : "NEW NAVIGATION");

  // Capture after page loads - reduced delay for faster capture
  const captureDelay = 500; // Reduced from 1500ms to 500ms
  
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => {
        try {
          const pageContext = capturePageContext();
          // Add session ID to context
          (pageContext as any).sessionId = sessionId;
          sendPageCapture(pageContext, isRefresh);
        } catch (err) {
          console.error("Cortex: Error capturing page", err);
        }
      }, captureDelay);
    });
  } else {
    // Page already loaded
    setTimeout(() => {
      try {
        const pageContext = capturePageContext();
        // Add session ID to context
        (pageContext as any).sessionId = sessionId;
        sendPageCapture(pageContext, isRefresh);
      } catch (err) {
        console.error("Cortex: Error capturing page", err);
      }
    }, captureDelay);
  }
}

// Start initialization immediately
init();
