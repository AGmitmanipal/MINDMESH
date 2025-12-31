/**
 * Activity Insights Service
 * Analyzes browsing patterns and generates insights
 */

import type { MemoryNode } from "@shared/extension-types";
import { cortexStorage } from "../utils/storage";
import { recallService } from "./recall-service";

export interface ActivityInsight {
  id: string;
  type: "time_spent" | "domain_focus" | "topic_trend" | "productivity" | "pattern";
  title: string;
  description: string;
  data: Record<string, unknown>;
  timestamp: number;
  confidence: number;
}

export interface ActivityStats {
  totalPages: number;
  totalTime: number; // Estimated in milliseconds
  uniqueDomains: number;
  topDomains: Array<{ domain: string; count: number; timeSpent: number }>;
  topKeywords: Array<{ keyword: string; count: number }>;
  hourlyDistribution: number[]; // 24 hours
  dailyDistribution: number[]; // 7 days
}

export class ActivityInsightsService {
  /**
   * Generate comprehensive activity insights
   */
  async generateInsights(days: number = 7): Promise<ActivityInsight[]> {
    const insights: ActivityInsight[] = [];
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const allNodes = await cortexStorage.getAllMemoryNodes();
    const recentNodes = allNodes.filter((node) => node.timestamp >= cutoff);

    // 1. Time spent analysis
    const timeSpent = this.calculateTimeSpent(recentNodes);
    insights.push({
      id: "time_spent",
      type: "time_spent",
      title: "Time Spent Browsing",
      description: `You've browsed approximately ${Math.round(timeSpent / 60 / 60)} hours in the last ${days} days`,
      data: { hours: timeSpent / 60 / 60, days },
      timestamp: Date.now(),
      confidence: 0.8,
    });

    // 2. Domain focus
    const domainFocus = this.analyzeDomainFocus(recentNodes);
    if (domainFocus.topDomain) {
      insights.push({
        id: "domain_focus",
        type: "domain_focus",
        title: "Primary Focus",
        description: `You spend most of your time on ${domainFocus.topDomain.domain} (${domainFocus.topDomain.percentage}% of visits)`,
        data: domainFocus,
        timestamp: Date.now(),
        confidence: 0.9,
      });
    }

    // 3. Topic trends
    const topicTrends = this.analyzeTopicTrends(recentNodes);
    if (topicTrends.topTopic) {
      insights.push({
        id: "topic_trend",
        type: "topic_trend",
        title: "Current Interest",
        description: `Your recent browsing focuses on "${topicTrends.topTopic}"`,
        data: topicTrends,
        timestamp: Date.now(),
        confidence: 0.7,
      });
    }

    // 4. Productivity patterns
    const productivity = this.analyzeProductivity(recentNodes);
    insights.push({
      id: "productivity",
      type: "productivity",
      title: "Browsing Patterns",
      description: productivity.description,
      data: productivity,
      timestamp: Date.now(),
      confidence: 0.75,
    });

    // 5. Behavioral patterns
    const patterns = this.detectPatterns(recentNodes);
    patterns.forEach((pattern, index) => {
      insights.push({
        id: `pattern_${index}`,
        type: "pattern",
        title: pattern.title,
        description: pattern.description,
        data: pattern,
        timestamp: Date.now(),
        confidence: pattern.confidence,
      });
    });

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get comprehensive activity statistics
   */
  async getActivityStats(days: number = 30): Promise<ActivityStats> {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const allNodes = await cortexStorage.getAllMemoryNodes();
    const recentNodes = allNodes.filter((node) => node.timestamp >= cutoff);

    const domainCounts = new Map<string, number>();
    const domainTimes = new Map<string, number>();
    const keywordCounts = new Map<string, number>();
    const hourlyCounts = new Array(24).fill(0);
    const dailyCounts = new Array(7).fill(0);

    recentNodes.forEach((node) => {
      const domain = node.metadata.domain;
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
      domainTimes.set(domain, (domainTimes.get(domain) || 0) + 30000); // Estimate 30s per page

      node.keywords.forEach((kw) => {
        keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
      });

      const date = new Date(node.timestamp);
      hourlyCounts[date.getHours()]++;
      dailyCounts[date.getDay()]++;
    });

    const topDomains = Array.from(domainCounts.entries())
      .map(([domain, count]) => ({
        domain,
        count,
        timeSpent: domainTimes.get(domain) || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topKeywords = Array.from(keywordCounts.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const uniqueDomains = new Set(recentNodes.map((n) => n.metadata.domain)).size;
    const totalTime = Array.from(domainTimes.values()).reduce((sum, time) => sum + time, 0);

    return {
      totalPages: recentNodes.length,
      totalTime,
      uniqueDomains,
      topDomains,
      topKeywords,
      hourlyDistribution: hourlyCounts,
      dailyDistribution: dailyCounts,
    };
  }

  private calculateTimeSpent(nodes: MemoryNode[]): number {
    // Estimate: 30 seconds per page on average
    return nodes.length * 30 * 1000;
  }

  private analyzeDomainFocus(nodes: MemoryNode[]): {
    topDomain?: { domain: string; count: number; percentage: number };
    distribution: Array<{ domain: string; count: number; percentage: number }>;
  } {
    const domainCounts = new Map<string, number>();
    nodes.forEach((node) => {
      const domain = node.metadata.domain;
      domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    });

    const distribution = Array.from(domainCounts.entries())
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: (count / nodes.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      topDomain: distribution[0],
      distribution: distribution.slice(0, 5),
    };
  }

  private analyzeTopicTrends(nodes: MemoryNode[]): {
    topTopic?: string;
    topics: Array<{ keyword: string; count: number }>;
  } {
    const keywordCounts = new Map<string, number>();
    nodes.forEach((node) => {
      node.keywords.forEach((kw) => {
        keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
      });
    });

    const topics = Array.from(keywordCounts.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      topTopic: topics[0]?.keyword,
      topics,
    };
  }

  private analyzeProductivity(nodes: MemoryNode[]): {
    description: string;
    clusterCount: number;
    avgPagesPerSession: number;
  } {
    const sessionMap = new Map<string, number>();
    nodes.forEach((node) => {
      const sessionId = node.metadata.sessionId || "unknown";
      sessionMap.set(sessionId, (sessionMap.get(sessionId) || 0) + 1);
    });

    const avgPagesPerSession =
      sessionMap.size > 0
        ? Array.from(sessionMap.values()).reduce((sum, count) => sum + count, 0) / sessionMap.size
        : 0;

    let description = "Your browsing shows ";
    if (avgPagesPerSession > 20) {
      description += "deep focus with long sessions";
    } else if (avgPagesPerSession > 10) {
      description += "moderate engagement";
    } else {
      description += "quick browsing patterns";
    }

    return {
      description,
      clusterCount: sessionMap.size,
      avgPagesPerSession: Math.round(avgPagesPerSession),
    };
  }

  private detectPatterns(nodes: MemoryNode[]): Array<{
    title: string;
    description: string;
    confidence: number;
  }> {
    const patterns: Array<{ title: string; description: string; confidence: number }> = [];

    // Pattern: Repeated domain visits
    const domainVisits = new Map<string, number[]>();
    nodes.forEach((node) => {
      const domain = node.metadata.domain;
      if (!domainVisits.has(domain)) {
        domainVisits.set(domain, []);
      }
      domainVisits.get(domain)!.push(node.timestamp);
    });

    for (const [domain, timestamps] of domainVisits.entries()) {
      if (timestamps.length >= 5) {
        // Check if visits are clustered in time
        const sorted = timestamps.sort((a, b) => a - b);
        const intervals = [];
        for (let i = 1; i < sorted.length; i++) {
          intervals.push(sorted[i] - sorted[i - 1]);
        }
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const hours = avgInterval / (60 * 60 * 1000);

        if (hours < 24) {
          patterns.push({
            title: "Frequent Visits",
            description: `You visit ${domain} frequently (${timestamps.length} times recently)`,
            confidence: 0.8,
          });
        }
      }
    }

    return patterns;
  }
}

export const activityInsightsService = new ActivityInsightsService();

