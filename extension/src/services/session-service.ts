/**
 * Session Diff & Merge Service
 * Tracks browsing sessions and identifies changes
 */

import type { MemoryNode } from "@shared/extension-types";
import { cortexStorage } from "../utils/storage";
import { cosineSimilarity } from "../utils/vector-search";

export interface BrowsingSession {
  id: string;
  startTime: number;
  endTime?: number;
  pages: MemoryNode[];
  keywords: string[];
  domains: string[];
}

export interface SessionDiff {
  added: MemoryNode[];
  removed: MemoryNode[];
  modified: Array<{ old: MemoryNode; new: MemoryNode }>;
  similarity: number;
}

export class SessionService {
  private currentSessionId: string | null = null;
  private sessionStartTime: number = Date.now();

  /**
   * Start a new browsing session
   */
  startSession(): string {
    this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessionStartTime = Date.now();
    return this.currentSessionId;
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string {
    if (!this.currentSessionId) {
      return this.startSession();
    }
    return this.currentSessionId;
  }

  /**
   * Get pages in current session
   */
  async getCurrentSessionPages(): Promise<MemoryNode[]> {
    const sessionId = this.getCurrentSessionId();
    const allNodes = await cortexStorage.getAllMemoryNodes();
    return allNodes.filter((node) => node.metadata.sessionId === sessionId);
  }

  /**
   * Compare two sessions and find differences
   */
  async diffSessions(
    sessionId1: string,
    sessionId2: string
  ): Promise<SessionDiff> {
    const allNodes = await cortexStorage.getAllMemoryNodes();
    const session1Pages = allNodes.filter(
      (n) => n.metadata.sessionId === sessionId1
    );
    const session2Pages = allNodes.filter(
      (n) => n.metadata.sessionId === sessionId2
    );

    // Find added pages (in session2 but not in session1)
    const session1Urls = new Set(session1Pages.map((p) => p.url));
    const added = session2Pages.filter((p) => !session1Urls.has(p.url));

    // Find removed pages (in session1 but not in session2)
    const session2Urls = new Set(session2Pages.map((p) => p.url));
    const removed = session1Pages.filter((p) => !session2Urls.has(p.url));

    // Find modified pages (same URL but different content)
    const modified: Array<{ old: MemoryNode; new: MemoryNode }> = [];
    const session1Map = new Map(session1Pages.map((p) => [p.url, p]));
    const session2Map = new Map(session2Pages.map((p) => [p.url, p]));

    for (const [url, page1] of session1Map.entries()) {
      const page2 = session2Map.get(url);
      if (page2 && page1.timestamp !== page2.timestamp) {
        modified.push({ old: page1, new: page2 });
      }
    }

    // Calculate overall similarity
    const similarity = this.calculateSessionSimilarity(session1Pages, session2Pages);

    return {
      added,
      removed,
      modified,
      similarity,
    };
  }

  /**
   * Merge two sessions (combine pages)
   */
  async mergeSessions(
    sessionId1: string,
    sessionId2: string
  ): Promise<BrowsingSession> {
    const allNodes = await cortexStorage.getAllMemoryNodes();
    const session1Pages = allNodes.filter(
      (n) => n.metadata.sessionId === sessionId1
    );
    const session2Pages = allNodes.filter(
      (n) => n.metadata.sessionId === sessionId2
    );

    // Combine pages, removing duplicates by URL
    const urlMap = new Map<string, MemoryNode>();
    [...session1Pages, ...session2Pages].forEach((page) => {
      const existing = urlMap.get(page.url);
      if (!existing || page.timestamp > existing.timestamp) {
        urlMap.set(page.url, page);
      }
    });

    const mergedPages = Array.from(urlMap.values());
    const keywords = this.extractCommonKeywords(mergedPages);
    const domains = Array.from(new Set(mergedPages.map((p) => p.metadata.domain)));

    return {
      id: `merged_${sessionId1}_${sessionId2}`,
      startTime: Math.min(
        session1Pages[0]?.timestamp || Date.now(),
        session2Pages[0]?.timestamp || Date.now()
      ),
      endTime: Math.max(
        session1Pages[session1Pages.length - 1]?.timestamp || Date.now(),
        session2Pages[session2Pages.length - 1]?.timestamp || Date.now()
      ),
      pages: mergedPages,
      keywords,
      domains,
    };
  }

  /**
   * Calculate similarity between two sessions
   */
  private calculateSessionSimilarity(
    session1: MemoryNode[],
    session2: MemoryNode[]
  ): number {
    if (session1.length === 0 && session2.length === 0) return 1;
    if (session1.length === 0 || session2.length === 0) return 0;

    // URL overlap
    const urls1 = new Set(session1.map((p) => p.url));
    const urls2 = new Set(session2.map((p) => p.url));
    const urlOverlap = Array.from(urls1).filter((url) => urls2.has(url)).length;
    const urlSimilarity = urlOverlap / Math.max(urls1.size, urls2.size);

    // Keyword overlap
    const keywords1 = new Set(session1.flatMap((p) => p.keywords));
    const keywords2 = new Set(session2.flatMap((p) => p.keywords));
    const keywordOverlap = Array.from(keywords1).filter((kw) => keywords2.has(kw)).length;
    const keywordSimilarity =
      Math.max(keywords1.size, keywords2.size) > 0
        ? keywordOverlap / Math.max(keywords1.size, keywords2.size)
        : 0;

    // Domain overlap
    const domains1 = new Set(session1.map((p) => p.metadata.domain));
    const domains2 = new Set(session2.map((p) => p.metadata.domain));
    const domainOverlap = Array.from(domains1).filter((d) => domains2.has(d)).length;
    const domainSimilarity =
      Math.max(domains1.size, domains2.size) > 0
        ? domainOverlap / Math.max(domains1.size, domains2.size)
        : 0;

    // Weighted average
    return urlSimilarity * 0.5 + keywordSimilarity * 0.3 + domainSimilarity * 0.2;
  }

  /**
   * Extract common keywords from pages
   */
  private extractCommonKeywords(pages: MemoryNode[]): string[] {
    const keywordCounts = new Map<string, number>();
    pages.forEach((page) => {
      page.keywords.forEach((kw) => {
        keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
      });
    });

    return Array.from(keywordCounts.entries())
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 10)
      .map(([kw]) => kw);
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<{
    pageCount: number;
    duration: number;
    uniqueDomains: number;
    topKeywords: string[];
  }> {
    const allNodes = await cortexStorage.getAllMemoryNodes();
    const sessionPages = allNodes.filter(
      (n) => n.metadata.sessionId === sessionId
    );

    if (sessionPages.length === 0) {
      return {
        pageCount: 0,
        duration: 0,
        uniqueDomains: 0,
        topKeywords: [],
      };
    }

    const sortedPages = sessionPages.sort((a, b) => a.timestamp - b.timestamp);
    const startTime = sortedPages[0].timestamp;
    const endTime = sortedPages[sortedPages.length - 1].timestamp;
    const duration = endTime - startTime;

    const domains = new Set(sessionPages.map((p) => p.metadata.domain));
    const keywords = this.extractCommonKeywords(sessionPages);

    return {
      pageCount: sessionPages.length,
      duration,
      uniqueDomains: domains.size,
      topKeywords: keywords,
    };
  }
}

export const sessionService = new SessionService();

