/**
 * BrowserController
 * Deterministic, budget-friendly tab/page control for MV3 extensions.
 *
 * Notes:
 * - Uses chrome.tabs + chrome.scripting + messaging to content script.
 * - Adds timeouts, retries, and simple waits to make navigation deterministic.
 */

import type { AgentDomSnapshot } from "@shared/extension-types";

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

export class BrowserController {
  async getActiveTabId(): Promise<number> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;
    if (typeof tabId !== "number") throw new Error("No active tab found");
    return tabId;
  }

  async ensureTabId(tabId?: number, startUrl?: string): Promise<number> {
    if (typeof tabId === "number") return tabId;
    if (startUrl) {
      const tab = await chrome.tabs.create({ url: startUrl, active: true });
      if (typeof tab.id !== "number") throw new Error("Failed to create tab");
      await this.waitForNavigationComplete(tab.id, 20000);
      return tab.id;
    }
    return await this.getActiveTabId();
  }

  async waitForNavigationComplete(tabId: number, timeoutMs: number): Promise<void> {
    return await withTimeout(
      new Promise<void>((resolve) => {
        const listener = (updatedTabId: number, info: chrome.tabs.TabChangeInfo) => {
          if (updatedTabId !== tabId) return;
          if (info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      }),
      timeoutMs,
      "waitForNavigationComplete"
    );
  }

  async navigate(tabId: number, url: string, timeoutMs: number): Promise<void> {
    await chrome.tabs.update(tabId, { url });
    await this.waitForNavigationComplete(tabId, timeoutMs);
  }

  async executeScript<T>(
    tabId: number,
    func: (...args: any[]) => T,
    args: any[] = [],
    timeoutMs: number = 15000
  ): Promise<T> {
    const run = async () => {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func,
        args,
      });
      // In MV3, executeScript returns array of results (one per frame). We default to top frame.
      const first = results?.[0]?.result as T;
      return first;
    };
    return await withTimeout(run(), timeoutMs, "executeScript");
  }

  async waitForSelector(tabId: number, selector: string, timeoutMs: number, pollMs: number = 250): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const exists = await this.executeScript<boolean>(
        tabId,
        (sel: string) => Boolean(document.querySelector(sel)),
        [selector],
        Math.min(5000, timeoutMs)
      );
      if (exists) return true;
      await delay(pollMs);
    }
    return false;
  }

  async click(tabId: number, selector: string, timeoutMs: number): Promise<boolean> {
    return await this.executeScript<boolean>(
      tabId,
      (sel: string) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (!el) return false;
        try {
          el.scrollIntoView({ block: "center", inline: "center" });
        } catch {}
        el.click();
        return true;
      },
      [selector],
      timeoutMs
    );
  }

  async type(tabId: number, selector: string, text: string, timeoutMs: number, clearFirst: boolean = true): Promise<boolean> {
    return await this.executeScript<boolean>(
      tabId,
      (sel: string, value: string, clear: boolean) => {
        const el = document.querySelector(sel) as HTMLInputElement | HTMLTextAreaElement | null;
        if (!el) return false;
        try {
          el.scrollIntoView({ block: "center", inline: "center" });
        } catch {}
        if (clear) el.value = "";
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      },
      [selector, text, clearFirst],
      timeoutMs
    );
  }

  async fillForm(tabId: number, fields: Record<string, string>, timeoutMs: number): Promise<void> {
    await this.executeScript<void>(
      tabId,
      (f: Record<string, string>) => {
        Object.entries(f).forEach(([selector, value]) => {
          const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null;
          if (!element) return;
          element.value = value;
          element.dispatchEvent(new Event("input", { bubbles: true }));
          element.dispatchEvent(new Event("change", { bubbles: true }));
        });
      },
      [fields],
      timeoutMs
    );
  }

  async extractDomSnapshot(tabId: number, timeoutMs: number): Promise<AgentDomSnapshot> {
    const run = async () => {
      const response = await chrome.tabs.sendMessage(tabId, { type: "AGENT_EXTRACT_DOM" });
      return response as AgentDomSnapshot;
    };
    return await withTimeout(run(), timeoutMs, "extractDomSnapshot");
  }
}

export const browserController = new BrowserController();


