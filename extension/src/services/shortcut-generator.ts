/**
 * Shortcut Generator
 * Creates keyboard shortcuts and automation for common tasks
 */

import type { MemoryNode } from "@shared/extension-types";
import { cortexStorage } from "../utils/storage";
import { recallService } from "./recall-service";

export interface Shortcut {
  id: string;
  name: string;
  description: string;
  keybinding: string;
  action: {
    type: "open_url" | "search" | "fill_form" | "execute_script";
    data: string | { url: string; query: string; fields?: Record<string, string> };
  };
  usageCount: number;
  lastUsed: number;
}

export class ShortcutGenerator {
  /**
   * Generate shortcuts based on browsing patterns
   */
  async generateShortcuts(limit: number = 10): Promise<Shortcut[]> {
    const shortcuts: Shortcut[] = [];

    // 1. Frequent domains
    const allNodes = await cortexStorage.getAllMemoryNodes();
    const domainCounts = new Map<string, { count: number; latestUrl: string; latestTime: number }>();

    allNodes.forEach((node) => {
      const domain = node.metadata.domain;
      const existing = domainCounts.get(domain) || { count: 0, latestUrl: node.url, latestTime: node.timestamp };
      existing.count++;
      if (node.timestamp > existing.latestTime) {
        existing.latestUrl = node.url;
        existing.latestTime = node.timestamp;
      }
      domainCounts.set(domain, existing);
    });

    const topDomains = Array.from(domainCounts.entries())
      .sort(([_, a], [__, b]) => b.count - a.count)
      .slice(0, 5);

    topDomains.forEach(([domain, data], index) => {
      shortcuts.push({
        id: `domain_${domain}`,
        name: `Open ${domain}`,
        description: `Quick access to ${domain} (visited ${data.count} times)`,
        keybinding: `Ctrl+Shift+${index + 1}`,
        action: {
          type: "open_url",
          data: data.latestUrl,
        },
        usageCount: data.count,
        lastUsed: data.latestTime,
      });
    });

    // 2. Common search patterns
    const recentPages = await recallService.getRecentPages(168, 50); // Last week
    const searchPatterns = this.detectSearchPatterns(recentPages);

    searchPatterns.forEach((pattern, index) => {
      shortcuts.push({
        id: `search_${pattern.query}`,
        name: `Search: ${pattern.query}`,
        description: `Quick search for "${pattern.query}"`,
        keybinding: `Ctrl+Shift+S${index + 1}`,
        action: {
          type: "search",
          data: pattern.query,
        },
        usageCount: pattern.count,
        lastUsed: Date.now(),
      });
    });

    return shortcuts
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Detect common search patterns from browsing history
   */
  private detectSearchPatterns(pages: MemoryNode[]): Array<{ query: string; count: number }> {
    // Extract potential search queries from page titles and keywords
    const queryCounts = new Map<string, number>();

    pages.forEach((page) => {
      // Look for search-like patterns in titles
      const title = page.title.toLowerCase();
      if (title.includes("search") || title.includes("results")) {
        // Extract potential query from title
        const words = page.keywords.slice(0, 3).join(" ");
        if (words.length > 3) {
          queryCounts.set(words, (queryCounts.get(words) || 0) + 1);
        }
      }

      // Use top keywords as potential queries
      if (page.keywords.length > 0) {
        const topKeywords = page.keywords.slice(0, 2).join(" ");
        queryCounts.set(topKeywords, (queryCounts.get(topKeywords) || 0) + 1);
      }
    });

    return Array.from(queryCounts.entries())
      .filter(([_, count]) => count >= 2)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  /**
   * Generate form fill shortcuts for frequently visited forms
   */
  async generateFormShortcuts(): Promise<Shortcut[]> {
    const allNodes = await cortexStorage.getAllMemoryNodes();
    
    // Detect form pages (pages with specific keywords or patterns)
    const formPages = allNodes.filter((node) => {
      const text = node.readableText.toLowerCase();
      const title = node.title.toLowerCase();
      return (
        text.includes("form") ||
        text.includes("submit") ||
        title.includes("login") ||
        title.includes("sign up") ||
        title.includes("register")
      );
    });

    return formPages.slice(0, 5).map((page, index) => ({
      id: `form_${page.id}`,
      name: `Fill: ${page.title}`,
      description: `Auto-fill form on ${page.metadata.domain}`,
      keybinding: `Ctrl+Shift+F${index + 1}`,
      action: {
        type: "fill_form",
        data: {
          url: page.url,
          fields: {}, // Would be populated from actual form data
        },
      },
      usageCount: 1,
      lastUsed: page.timestamp,
    }));
  }

  /**
   * Execute a shortcut action
   */
  async executeShortcut(shortcut: Shortcut): Promise<void> {
    switch (shortcut.action.type) {
      case "open_url":
        if (typeof shortcut.action.data === "string") {
          chrome.tabs.create({ url: shortcut.action.data });
        }
        break;
      case "search":
        if (typeof shortcut.action.data === "string") {
          // Open search results
          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(shortcut.action.data)}`;
          chrome.tabs.create({ url: searchUrl });
        }
        break;
      case "fill_form":
        // Would inject script to fill form
        console.log("Form fill not yet implemented");
        break;
      case "execute_script":
        // Would execute custom script
        console.log("Script execution not yet implemented");
        break;
    }

    // Update usage stats
    shortcut.usageCount++;
    shortcut.lastUsed = Date.now();
  }
}

export const shortcutGenerator = new ShortcutGenerator();

