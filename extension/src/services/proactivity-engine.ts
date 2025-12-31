/**
 * Proactivity Engine
 * Anticipates user needs and suggests actions
 */

import type { MemoryNode } from "@shared/extension-types";
import { cortexStorage } from "../utils/storage";
import { recallService } from "./recall-service";

export interface ProactiveSuggestion {
  id: string;
  type: "related_page" | "recent_revisit" | "cluster_expansion" | "task_completion";
  title: string;
  description: string;
  action: {
    type: "open_url" | "show_cluster" | "complete_form";
    data: string | { url: string; fields: Record<string, string> };
  };
  confidence: number;
  timestamp: number;
}

export class ProactivityEngine {
  /**
   * Generate proactive suggestions based on current context
   */
  async generateSuggestions(
    currentUrl: string,
    limit: number = 5
  ): Promise<ProactiveSuggestion[]> {
    const suggestions: ProactiveSuggestion[] = [];

    // 1. Related pages based on semantic similarity
    const relatedPages = await recallService.getRelatedPages(currentUrl, 3);
    for (const page of relatedPages) {
      suggestions.push({
        id: `related_${page.id}`,
        type: "related_page",
        title: `Related: ${page.title}`,
        description: `You might be interested in this related page`,
        action: {
          type: "open_url",
          data: page.url,
        },
        confidence: 0.7,
        timestamp: Date.now(),
      });
    }

    // 2. Recent revisits - pages visited multiple times
    const recentPages = await recallService.getRecentPages(24, 50);
    const revisitCounts = new Map<string, number>();
    recentPages.forEach((page) => {
      const domain = page.metadata.domain;
      revisitCounts.set(domain, (revisitCounts.get(domain) || 0) + 1);
    });

    const frequentDomains = Array.from(revisitCounts.entries())
      .filter(([_, count]) => count >= 3)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 2);

    for (const [domain, count] of frequentDomains) {
      const domainPages = await recallService.getPagesByDomain(domain);
      if (domainPages.length > 0) {
        const latestPage = domainPages.sort((a, b) => b.timestamp - a.timestamp)[0];
        suggestions.push({
          id: `revisit_${domain}`,
          type: "recent_revisit",
          title: `Revisit ${domain}`,
          description: `You've visited this site ${count} times recently`,
          action: {
            type: "open_url",
            data: latestPage.url,
          },
          confidence: 0.8,
          timestamp: Date.now(),
        });
      }
    }

    // 3. Cluster expansion - suggest adding more pages to existing clusters
    const clusters = await cortexStorage.getAllClusters();
    if (clusters.length > 0) {
      const largestCluster = clusters.sort((a, b) => b.nodes.length - a.nodes.length)[0];
      if (largestCluster.nodes.length > 0 && largestCluster.nodes.length < 10) {
        suggestions.push({
          id: `cluster_${largestCluster.id}`,
          type: "cluster_expansion",
          title: `Expand "${largestCluster.name}" cluster`,
          description: `You have ${largestCluster.nodes.length} pages in this cluster. Find more related content?`,
          action: {
            type: "show_cluster",
            data: largestCluster.id,
          },
          confidence: 0.6,
          timestamp: Date.now(),
        });
      }
    }

    // Sort by confidence and return top N
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Detect if user is working on a task (multiple related pages in short time)
   */
  async detectActiveTask(): Promise<{
    isActive: boolean;
    taskPages: MemoryNode[];
    taskKeywords: string[];
  }> {
    const recentPages = await recallService.getRecentPages(2, 20); // Last 2 hours

    if (recentPages.length < 3) {
      return { isActive: false, taskPages: [], taskKeywords: [] };
    }

    // Find common keywords across recent pages
    const keywordCounts = new Map<string, number>();
    recentPages.forEach((page) => {
      page.keywords?.forEach((kw) => {
        keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
      });
    });

    const commonKeywords = Array.from(keywordCounts.entries())
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([kw]) => kw);

    const isActive = commonKeywords.length >= 2;

    return {
      isActive,
      taskPages: recentPages,
      taskKeywords: commonKeywords,
    };
  }

  /**
   * Suggest shortcuts based on browsing patterns
   */
  async suggestShortcuts(): Promise<Array<{
    shortcut: string;
    description: string;
    action: string;
  }>> {
    const recentPages = await recallService.getRecentPages(168, 100); // Last week
    const domainPatterns = new Map<string, number>();

    recentPages.forEach((page) => {
      const domain = page.metadata.domain;
      domainPatterns.set(domain, (domainPatterns.get(domain) || 0) + 1);
    });

    const topDomains = Array.from(domainPatterns.entries())
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5);

    return topDomains.map(([domain, count]) => ({
      shortcut: domain,
      description: `Quick access to ${domain} (visited ${count} times)`,
      action: `https://${domain}`,
    }));
  }
}

export const proactivityEngine = new ProactivityEngine();

