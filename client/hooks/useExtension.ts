import { useState, useEffect, useCallback } from "react";
import type { MemoryNode, ExtensionMessage } from "@shared/extension-types";

export function useExtension() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [extensionId, setExtensionId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Initialize extension ID from URL, window, or custom event
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("extId");
    
    if (idFromUrl) {
      setExtensionId(idFromUrl);
      (window as any).CORTEX_EXTENSION_ID = idFromUrl;
      console.log("Cortex: Extension ID from URL:", idFromUrl);
    } else if ((window as any).CORTEX_EXTENSION_ID) {
      const existingId = (window as any).CORTEX_EXTENSION_ID;
      setExtensionId(existingId);
      console.log("Cortex: Extension ID from window:", existingId);
    }

    // 1. Listen for extension ready event
    const handleReady = (event: any) => {
      if (event.detail?.id) {
        setExtensionId(event.detail.id);
        setIsAvailable(true);
        setIsChecking(false);
      }
    };
    window.addEventListener("cortex-extension-ready", handleReady);

    // 2. Listen for postMessage handshake response
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "CORTEX_ID_RESPONSE" && event.data.id) {
        setExtensionId(event.data.id);
        setIsAvailable(true);
        setIsChecking(false);
      }
    };
    window.addEventListener("message", handleMessage);

    // 3. Fallback: check if content script already set the ID on window
    const checkWindow = () => {
      const windowId = (window as any).CORTEX_EXTENSION_ID;
      if (windowId && !extensionId) {
        setExtensionId(windowId);
        setIsAvailable(true);
        setIsChecking(false);
        return true;
      }
      return false;
    };

    // Immediate check
    checkWindow();

    // 4. Continuous Handshake (Query for the extension every second)
    const handshakeInterval = setInterval(() => {
      if (!extensionId) {
        window.postMessage({ type: "CORTEX_QUERY_EXTENSION" }, "*");
        checkWindow();
      }
    }, 1000);
    
    return () => {
      window.removeEventListener("cortex-extension-ready", handleReady);
      window.removeEventListener("message", handleMessage);
      clearInterval(handshakeInterval);
    };
  }, []);

  // Check if extension is available with retry logic
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    let retryTimeout: NodeJS.Timeout;

    const checkExtension = async () => {
      const targetId = extensionId || (window as any).CORTEX_EXTENSION_ID;
      
      try {
        // If we have chrome.runtime, try pinging the extension
        if (typeof chrome !== "undefined" && chrome.runtime) {
          
          // Try internal message first (if we're inside the extension)
          if (chrome.runtime.sendMessage && !targetId) {
            chrome.runtime.sendMessage({ type: "PING" }, (response) => {
              if (chrome.runtime.lastError) {
                console.log("Cortex: Not in extension context, will use external messaging");
              } else if (response?.success) {
                console.log("Cortex: Extension available (internal)");
                setIsAvailable(true);
                setIsChecking(false);
              }
            });
          }
          
          // Try external message with ID
          if (targetId && chrome.runtime.sendMessage) {
            console.log("Cortex: Pinging extension with ID:", targetId);
            chrome.runtime.sendMessage(targetId, { type: "PING" }, (response: any) => {
              if (chrome.runtime.lastError) {
                console.log("Cortex: Ping failed:", chrome.runtime.lastError.message);
                
                // Retry if we haven't exceeded max retries
                if (retryCount < maxRetries) {
                  retryCount++;
                  console.log(`Cortex: Retrying ping (${retryCount}/${maxRetries})...`);
                  retryTimeout = setTimeout(checkExtension, 1000);
                } else {
                  console.log("Cortex: Extension not available after retries");
                  setIsAvailable(false);
                  setIsChecking(false);
                }
              } else if (response?.success) {
                console.log("Cortex: Extension available (external)");
                setIsAvailable(true);
                setIsChecking(false);
              }
            });
          } else if (!targetId) {
            // No ID yet, wait for it
            console.log("Cortex: Waiting for extension ID...");
            if (retryCount < maxRetries) {
              retryCount++;
              retryTimeout = setTimeout(checkExtension, 500);
            } else {
              setIsChecking(false);
            }
          }
        } else {
          console.log("Cortex: chrome.runtime not available");
          setIsAvailable(false);
          setIsChecking(false);
        }
      } catch (e) {
        console.error("Cortex: Error checking extension:", e);
        setIsAvailable(false);
        setIsChecking(false);
      }
    };

    // Start checking after a small delay to let content script inject
    const initialDelay = setTimeout(() => {
      checkExtension();
    }, 100);

    return () => {
      clearTimeout(initialDelay);
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [extensionId]);

  const sendMessage = useCallback(async <T>(message: ExtensionMessage): Promise<{ success: boolean; data?: T; error?: string }> => {
    const targetId = extensionId || (window as any).CORTEX_EXTENSION_ID;

    if (!targetId) {
      console.error("Cortex: No extension ID available for messaging");
      return { success: false, error: "Extension ID not available" };
    }

    return new Promise((resolve) => {
      // Increase timeout for heavy operations (AI model loading, analytics)
      const heavyOperations = ["SEARCH_MEMORY", "GET_ANALYTICS", "GET_ACTIVITY_INSIGHTS"];
      const timeoutMs = heavyOperations.includes(message.type) ? 30000 : 10000; // 30s for heavy, 10s for normal
      const timeout = setTimeout(() => {
        console.error(`Cortex: Message ${message.type} timed out after ${timeoutMs/1000}s`);
        resolve({ success: false, error: "Request timed out" });
      }, timeoutMs);

      try {
        if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
          clearTimeout(timeout);
          console.warn("Cortex: Chrome runtime not available for messaging");
          resolve({ success: false, error: "Chrome runtime not available" });
          return;
        }

        const start = Date.now();
        console.log(`Cortex: Sending message ${message.type} to extension ${targetId}`);
        
        // Always use external messaging with extension ID (we're on a webpage, not inside extension)
        chrome.runtime.sendMessage(targetId, message, (extResponse: any) => {
          const duration = Date.now() - start;
          clearTimeout(timeout);
          
          if (chrome.runtime.lastError) {
            console.error(`Cortex: Message ${message.type} failed after ${duration}ms:`, chrome.runtime.lastError.message);
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else {
            console.log(`Cortex: Message ${message.type} response received in ${duration}ms:`, extResponse);
            // Fix: The extension already returns { success: boolean, data?: T, error?: string }
            // We should resolve with it directly to avoid double wrapping
            resolve(extResponse || { success: false, error: "Empty response from extension" });
          }
        });
      } catch (error) {
        clearTimeout(timeout);
        console.error("Cortex: Exception sending message:", error);
        resolve({ success: false, error: String(error) });
      }
    });
  }, [extensionId]);

  const getStats = useCallback(async () => {
    const response = await sendMessage<any>({ type: "GET_STATS", payload: {} });
    console.log("useExtension: getStats response:", response);
    if (response.success && response.data) {
      return response.data;
    }
    return { pageCount: 0, storageSize: 0 };
  }, [sendMessage]);

  const getAnalytics = useCallback(async () => {
    try {
      const response = await sendMessage<any>({ type: "GET_ANALYTICS", payload: {} });
      console.log("useExtension: getAnalytics response:", response);
      if (response.success && response.data) {
        return response.data;
      }
      console.warn("useExtension: getAnalytics returned no data or failed:", response);
      return null;
    } catch (error) {
      console.error("useExtension: getAnalytics error:", error);
      return null;
    }
  }, [sendMessage]);

  const getAllPages = useCallback(async () => {
    const response = await sendMessage<MemoryNode[]>({ type: "GET_ALL_PAGES", payload: { limit: 100 } });
    console.log("useExtension: getAllPages response:", response);
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }, [sendMessage]);

  const searchMemory = useCallback(async (query: string) => {
    try {
      const response = await sendMessage<any>({ 
        type: "SEARCH_MEMORY", 
        payload: { query, limit: 20 } 
      });
      
      if (response.success && response.data) {
        const data = response.data;
        // Handle RecallResult from extension
        if (data.matches && Array.isArray(data.matches)) {
          return data.matches.map((match: any) => ({
            ...match.node,
            similarity: match.similarity,
            reason: match.reason // Preserve reason data for explain-why
          }));
        }
        
        // Fallback if it's already an array of nodes
        if (Array.isArray(data)) {
          return data;
        }
      }
      console.warn("useExtension: searchMemory returned no data or failed:", response);
      return [];
    } catch (error) {
      console.error("useExtension: searchMemory error:", error);
      return [];
    }
  }, [sendMessage]);

  const getCaptureSettings = useCallback(async () => {
    const response = await sendMessage<any>({ type: "GET_CAPTURE_SETTINGS", payload: {} });
    if (response.success && response.data) {
      return response.data;
    }
    return { enabled: true, excludeDomains: [], excludeKeywords: [], maxStorageSize: 0 };
  }, [sendMessage]);

  const updateCaptureSettings = useCallback(async (settings: any) => {
    return await sendMessage({ type: "UPDATE_CAPTURE_SETTINGS", payload: settings });
  }, [sendMessage]);

  return {
    isAvailable,
    isChecking,
    sendMessage,
    getStats,
    getAllPages,
    searchMemory,
    getCaptureSettings,
    updateCaptureSettings,
    getAnalytics,
  };
}
