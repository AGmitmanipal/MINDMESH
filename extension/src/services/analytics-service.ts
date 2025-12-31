/**
 * Analytics Service
 * Provides comprehensive user analytics: daily/monthly/yearly stats, top sites, top categories
 */

import type { MemoryNode } from "@shared/extension-types";
import { cortexStorage } from "../utils/storage";

export interface DailyStats {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  count: number;
}

export interface YearlyStats {
  year: string; // YYYY
  count: number;
}

export interface TopSite {
  domain: string;
  count: number;
  percentage: number;
  lastVisit: number;
}

export interface TopCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  daily: DailyStats[];
  monthly: MonthlyStats[];
  yearly: YearlyStats[];
  topSites: TopSite[];
  topCategories: TopCategory[];
  totalPages: number;
  uniqueDomains: number;
  dateRange: {
    start: number;
    end: number;
  };
}

export class AnalyticsService {
  /**
   * Get comprehensive analytics data
   */
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      console.log("AnalyticsService: Starting getAnalytics");
      // Add a reasonable limit to prevent loading all nodes at once (causes timeout)
      // 10k most recent nodes should be enough for analytics
      const allNodes = await cortexStorage.getAllMemoryNodes(10000);
      console.log("AnalyticsService: Loaded", allNodes.length, "nodes");
      
      if (allNodes.length === 0) {
        console.log("AnalyticsService: No nodes found, returning empty analytics");
        return {
          daily: [],
          monthly: [],
          yearly: [],
          topSites: [],
          topCategories: [],
          totalPages: 0,
          uniqueDomains: 0,
          dateRange: { start: Date.now(), end: Date.now() },
        };
      }

    // Sort by timestamp
    const sortedNodes = allNodes.sort((a, b) => a.timestamp - b.timestamp);
    const startTime = sortedNodes[0].timestamp;
    const endTime = sortedNodes[sortedNodes.length - 1].timestamp;

    // Calculate daily stats
    const daily = this.calculateDailyStats(allNodes);
    
    // Calculate monthly stats
    const monthly = this.calculateMonthlyStats(allNodes);
    
    // Calculate yearly stats
    const yearly = this.calculateYearlyStats(allNodes);
    
    // Calculate top sites
    const topSites = this.calculateTopSites(allNodes);
    
    // Calculate top categories
    const topCategories = this.calculateTopCategories(allNodes);

    const uniqueDomains = new Set(allNodes.map(n => n.metadata.domain)).size;

    console.log("AnalyticsService: Calculated analytics:", {
      daily: daily.length,
      monthly: monthly.length,
      yearly: yearly.length,
      topSites: topSites.length,
      topCategories: topCategories.length,
      totalPages: allNodes.length
    });

    return {
      daily,
      monthly,
      yearly,
      topSites,
      topCategories,
      totalPages: allNodes.length,
      uniqueDomains,
      dateRange: { start: startTime, end: endTime },
    };
    } catch (error) {
      console.error("AnalyticsService: Error getting analytics:", error);
      throw error;
    }
  }

  private calculateDailyStats(nodes: MemoryNode[]): DailyStats[] {
    const dailyMap = new Map<string, number>();
    
    nodes.forEach((node) => {
      const date = new Date(node.timestamp);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + 1);
    });

    return Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculateMonthlyStats(nodes: MemoryNode[]): MonthlyStats[] {
    const monthlyMap = new Map<string, number>();
    
    nodes.forEach((node) => {
      const date = new Date(node.timestamp);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthStr, (monthlyMap.get(monthStr) || 0) + 1);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateYearlyStats(nodes: MemoryNode[]): YearlyStats[] {
    const yearlyMap = new Map<string, number>();
    
    nodes.forEach((node) => {
      const yearStr = String(new Date(node.timestamp).getFullYear());
      yearlyMap.set(yearStr, (yearlyMap.get(yearStr) || 0) + 1);
    });

    return Array.from(yearlyMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }

  private calculateTopSites(nodes: MemoryNode[]): TopSite[] {
    const domainMap = new Map<string, { count: number; lastVisit: number }>();
    
    nodes.forEach((node) => {
      const domain = node.metadata.domain;
      const existing = domainMap.get(domain) || { count: 0, lastVisit: 0 };
      domainMap.set(domain, {
        count: existing.count + 1,
        lastVisit: Math.max(existing.lastVisit, node.timestamp),
      });
    });

    const total = nodes.length;
    
    return Array.from(domainMap.entries())
      .map(([domain, data]) => ({
        domain,
        count: data.count,
        percentage: (data.count / total) * 100,
        lastVisit: data.lastVisit,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  private calculateTopCategories(nodes: MemoryNode[]): TopCategory[] {
    const categoryMap = new Map<string, number>();
    
    nodes.forEach((node) => {
      // Use the same categorization logic as Dashboard
      const category = this.categorizeUrl(node.url || `https://${node.metadata.domain}`);
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const total = nodes.length;
    
    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }

  /**
   * Categorize URL using the same logic as Dashboard
   * Must match exactly with Dashboard's categorizeUrl function
   */
  private categorizeUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      
      // Category definitions - must match Dashboard exactly
      const CATEGORY_DEFINITIONS = {
        coding: {
          domains: ["leetcode", "hackerrank", "codeforces", "codewars", "atcoder", "topcoder", "spoj", "projecteuler", "codechef"]
        },
        developer: {
          domains: ["github", "gitlab", "bitbucket", "cursor", "vscode", "stackoverflow", "dev.to", "github.io", "git", "code"]
        },
        ai: {
          domains: ["gemini", "claude", "chatgpt", "openai", "anthropic", "perplexity", "poe", "bard"]
        },
        documentation: {
          domains: ["docs.", "developer.", "developers.", "learn.", "api.", "guide.", "reference.", "wiki.", "documentation.", "docs.nvidia", "developer.nvidia", "learn.microsoft", "docs.microsoft", "developer.microsoft", "docs.google", "developers.google", "docs.aws", "docs.github", "docs.gitlab", "docs.docker", "kubernetes.io/docs", "react.dev", "vuejs.org", "angular.io/docs", "nodejs.org/docs", "python.org/doc", "docs.python", "dev.mozilla.org", "developer.mozilla.org", "readthedocs.io", "gitbook.io", "devdocs.io"]
        },
        research: {
          domains: ["arxiv", "pubmed", "scholar.google", "researchgate", "academia.edu", "jstor", "ieee", "acm.org", "springer", "nature.com", "science.org", "cell.com", "plos.org", "biorxiv", "medrxiv"]
        },
        shopping: {
          domains: ["amazon", "ebay", "walmart", "etsy", "alibaba", "flipkart", "shopify", "bigcommerce", "target", "bestbuy"]
        },
        travel: {
          domains: ["booking", "airbnb", "expedia", "tripadvisor", "kayak", "hotels", "skyscanner", "makemytrip", "goibibo", "agoda"]
        },
        health: {
          domains: ["webmd", "healthline", "mayoclinic", "headspace", "calm", "myfitnesspal", "fitbit", "nhs.uk", "practo"]
        },
        food: {
          domains: ["allrecipes", "foodnetwork", "tasty", "minimalistbaker", "seriouseats", "yelp", "zomato", "swiggy", "ubereats"]
        },
        entertainment: {
          domains: ["netflix", "youtube", "spotify", "twitch", "hulu", "disneyplus", "primevideo", "hotstar", "apple.com/tv", "steam"]
        },
        jobs: {
          domains: ["linkedin", "indeed", "glassdoor", "naukri", "monster", "internshala", "angellist", "stackoverflow.com/jobs"]
        },
        social: {
          domains: ["facebook", "instagram", "twitter", "reddit", "tiktok", "pinterest", "snapchat", "telegram", "whatsapp", "discord"]
        },
        education: {
          domains: ["coursera", "udemy", "edx", "khanacademy", "skillshare", "linkedin.com/learning", "pluralsight", "udacity", "byju"]
        },
        news: {
          domains: ["bbc", "cnn", "nytimes", "theguardian", "reuters", "hindustantimes", "timesofindia", "medium", "substack"]
        },
        nonprofit: {
          domains: ["wikipedia", "wikimedia", "redcross", "unicef", "wwf", "greenpeace", "amnesty", "doctorswithoutborders"]
        },
        corporate: {
          domains: ["about", "careers", "company", "corporate", "investor"]
        },
        professional: {
          domains: ["bloomberg", "forbes", "wsj", "morningstar", "marketwatch", "investing", "tradingview"]
        },
        portfolio: {
          domains: ["behance", "dribbble", "deviantart", "artstation", "github.io", "portfolio", "wix.com/website"]
        },
        government: {
          domains: [".gov", "irs.gov", "usa.gov", "nic.in", "india.gov", "mygov"]
        }
      };

      // Priority order - must match Dashboard exactly
      const CATEGORY_PRIORITY_ORDER = [
        "coding", "ai", "developer", "documentation", "research",
        "shopping", "travel", "health", "food", "entertainment", "jobs", "social", "education", "news", "nonprofit", "corporate", "professional", "portfolio", "government"
      ];
      
      // Check categories in priority order
      for (const categoryKey of CATEGORY_PRIORITY_ORDER) {
        const category = CATEGORY_DEFINITIONS[categoryKey as keyof typeof CATEGORY_DEFINITIONS];
        if (category) {
          for (const domain of category.domains) {
            if (hostname.includes(domain.toLowerCase())) {
              return categoryKey;
            }
          }
        }
      }
      
      // Check remaining categories
      for (const [key, category] of Object.entries(CATEGORY_DEFINITIONS)) {
        if (!CATEGORY_PRIORITY_ORDER.includes(key)) {
          for (const domain of category.domains) {
            if (hostname.includes(domain.toLowerCase())) {
              return key;
            }
          }
        }
      }
    } catch (e) {
      console.error("AnalyticsService: Failed to categorize URL:", e);
    }
    
    return "miscellaneous";
  }
}

export const analyticsService = new AnalyticsService();

