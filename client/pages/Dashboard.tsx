import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search,
  Sidebar,
  Settings,
  HelpCircle,
  Loader,
  X,
  Download,
  Pause,
  Play,
  ExternalLink,
  TrendingUp,
  Clock,
  Trash2,
  Globe,
  Info,
  BarChart3
} from "lucide-react";
import Header from "@/components/Header";
import { useExtension } from "@/hooks/useExtension";
import type { MemoryNode } from "@shared/extension-types";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface PageMemory {
  id: string;
  url: string;
  title: string;
  snippet: string;
  timestamp: string;
  similarity: number;
  keywords: string[];
  domain: string;
  category?: string;
  reason?: {
    sharedKeywords: string[];
    contextMatch: string;
    semanticSimilarity: number;
  };
}

interface Cluster {
  id: string;
  name: string;
  color: string;
  itemCount: number;
  pages: PageMemory[];
  description: string;
}

// Category definitions with domain patterns
const CATEGORY_DEFINITIONS = {
  shopping: {
    name: "Shopping (Ecommerce)",
    description: "Platforms for buying products or services",
    domains: ["amazon", "ebay", "walmart", "etsy", "alibaba", "flipkart", "shopify", "bigcommerce", "target", "bestbuy"],
    color: "from-purple-500 to-purple-600"
  },
  travel: {
    name: "Traveling & Tourism",
    description: "Resources for planning and booking trips",
    domains: ["booking", "airbnb", "expedia", "tripadvisor", "kayak", "hotels", "skyscanner", "makemytrip", "goibibo", "agoda"],
    color: "from-blue-500 to-blue-600"
  },
  health: {
    name: "Health & Wellness",
    description: "Provides medical information, fitness routines, and mental health resources",
    domains: ["webmd", "healthline", "mayoclinic", "headspace", "calm", "myfitnesspal", "fitbit", "nhs.uk", "practo"],
    color: "from-green-500 to-green-600"
  },
  food: {
    name: "Food & Recipes",
    description: "Dedicated to cooking tips, dietary-specific recipes, and restaurant reviews",
    domains: ["allrecipes", "foodnetwork", "tasty", "minimalistbaker", "seriouseats", "yelp", "zomato", "swiggy", "ubereats"],
    color: "from-orange-500 to-orange-600"
  },
  entertainment: {
    name: "Entertainment",
    description: "Visual and media-heavy sites for streaming videos, music, or gaming",
    domains: ["netflix", "youtube", "spotify", "twitch", "hulu", "disneyplus", "primevideo", "hotstar", "apple.com/tv", "steam"],
    color: "from-pink-500 to-pink-600"
  },
  jobs: {
    name: "Job Search Websites",
    description: "Platforms like LinkedIn, Indeed, Naukri.com, Internshaala, etc.",
    domains: ["linkedin", "indeed", "glassdoor", "naukri", "monster", "internshala", "angellist", "stackoverflow.com/jobs"],
    color: "from-indigo-500 to-indigo-600"
  },
  social: {
    name: "Social Media",
    description: "Real-time networking and content-sharing platforms",
    domains: ["facebook", "instagram", "twitter", "reddit", "tiktok", "pinterest", "snapchat", "telegram", "whatsapp", "discord"],
    color: "from-cyan-500 to-cyan-600"
  },
  education: {
    name: "Educational (E-Learning)",
    description: "Platforms for structured courses and educational resources",
    domains: ["coursera", "udemy", "edx", "khanacademy", "skillshare", "linkedin.com/learning", "pluralsight", "udacity", "byju"],
    color: "from-yellow-500 to-yellow-600"
  },
  news: {
    name: "News & Magazines",
    description: "Portals for current events and editorial articles",
    domains: ["bbc", "cnn", "nytimes", "theguardian", "reuters", "hindustantimes", "timesofindia", "medium", "substack"],
    color: "from-red-500 to-red-600"
  },
  nonprofit: {
    name: "Nonprofit & NGO",
    description: "Sites dedicated to social causes, fundraising, and mission-driven advocacy",
    domains: ["wikipedia", "wikimedia", "redcross", "unicef", "wwf", "greenpeace", "amnesty", "doctorswithoutborders"],
    color: "from-teal-500 to-teal-600"
  },
  corporate: {
    name: "Corporate",
    description: "The official \"front door\" for companies, describing their mission, team, and services",
    domains: ["about", "careers", "company", "corporate", "investor"],
    color: "from-slate-500 to-slate-600"
  },
  professional: {
    name: "Professional Services",
    description: "Niche sites for legal, financial, or consulting firms",
    domains: ["bloomberg", "forbes", "wsj", "morningstar", "marketwatch", "investing", "tradingview"],
    color: "from-emerald-500 to-emerald-600"
  },
  portfolio: {
    name: "Portfolios",
    description: "Digital resumes for creative professionals like photographers and designers to showcase work",
    domains: ["behance", "dribbble", "deviantart", "artstation", "github.io", "portfolio", "wix.com/website"],
    color: "from-violet-500 to-violet-600"
  },
  government: {
    name: "Government",
    description: "Official portals providing public services and regulatory information",
    domains: [".gov", "irs.gov", "usa.gov", "nic.in", "india.gov", "mygov"],
    color: "from-blue-600 to-blue-700"
  },
  coding: {
    name: "Coding Practice & Challenges",
    description: "Programming practice platforms and coding challenges",
    domains: ["leetcode", "hackerrank", "codeforces", "codewars", "atcoder", "topcoder", "spoj", "projecteuler", "codechef"],
    color: "from-amber-500 to-amber-600"
  },
  ai: {
    name: "AI Tools & Assistants",
    description: "AI chatbots, assistants, and AI-powered platforms",
    domains: ["gemini", "claude", "chatgpt", "openai", "anthropic", "perplexity", "poe", "bard"],
    color: "from-fuchsia-500 to-fuchsia-600"
  },
  developer: {
    name: "Developer Tools",
    description: "Code editors, version control, and development platforms",
    domains: ["github", "gitlab", "bitbucket", "cursor", "vscode", "stackoverflow", "dev.to", "github.io", "git", "code"],
    color: "from-sky-500 to-sky-600"
  },
  documentation: {
    name: "Technical Documentation",
    description: "Developer documentation, API references, technical guides, and reference materials",
    domains: ["docs.", "developer.", "developers.", "learn.", "api.", "guide.", "reference.", "wiki.", "documentation.", "docs.nvidia", "developer.nvidia", "learn.microsoft", "docs.microsoft", "developer.microsoft", "docs.google", "developers.google", "docs.aws", "docs.github", "docs.gitlab", "docs.docker", "kubernetes.io/docs", "react.dev", "vuejs.org", "angular.io/docs", "nodejs.org/docs", "python.org/doc", "docs.python", "dev.mozilla.org", "developer.mozilla.org", "readthedocs.io", "gitbook.io", "devdocs.io"],
    color: "from-lime-500 to-lime-600"
  },
  research: {
    name: "Research & Academic",
    description: "Academic papers, research databases, scholarly articles, and scientific resources",
    domains: ["arxiv", "pubmed", "scholar.google", "researchgate", "academia.edu", "jstor", "ieee", "acm.org", "springer", "nature.com", "science.org", "cell.com", "plos.org", "biorxiv", "medrxiv"],
    color: "from-rose-500 to-rose-600"
  }
};

// Generate context match reason for explain-why
function generateContextMatchReason(query: string, node: any): string {
  if (!query) return "Saved page";
  
  const queryLower = query.toLowerCase();
  const titleLower = (node.title || "").toLowerCase();
  const domainLower = (node.metadata?.domain || "").toLowerCase();
  const textLower = (node.readableText || node.snippet || "").toLowerCase().slice(0, 500);
  
  if (titleLower === queryLower) {
    return "Exact title match";
  }
  if (titleLower.includes(queryLower)) {
    return "Title contains query terms";
  }
  if (domainLower.includes(queryLower)) {
    return "Domain contains query terms";
  }
  if (textLower.includes(queryLower)) {
    return "Content contains query terms";
  }
  if (node.keywords?.some((kw: string) => queryLower.includes(kw.toLowerCase()))) {
    return "Shared keywords match";
  }
  return "Semantic similarity match";
}

// Categorize a domain
// Priority order matters - more specific categories should be checked first
function categorizeUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    
    // Check categories in priority order (more specific first)
    // This ensures coding sites don't get misclassified as entertainment
    const priorityOrder = [
      "coding",      // Check coding first (leetcode, hackerrank, etc.)
      "developer",   // Then developer tools
      "ai",          // Then AI tools
      "documentation", // Then docs
      "research",    // Then research
      "jobs",        // Then job sites
      "education",   // Then education
      "shopping",    // Then shopping
      "travel",      // Then travel
      "health",      // Then health
      "food",        // Then food
      "entertainment", // Then entertainment (less specific)
      "social",      // Then social
      "news",        // Then news
      "nonprofit",   // Then nonprofit
      "corporate",   // Then corporate
      "professional", // Then professional
      "portfolio",   // Then portfolio
      "government",  // Then government
    ];
    
    // Check priority categories first
    for (const categoryKey of priorityOrder) {
      const category = CATEGORY_DEFINITIONS[categoryKey as keyof typeof CATEGORY_DEFINITIONS];
      if (category) {
        for (const domain of category.domains) {
          if (hostname.includes(domain.toLowerCase())) {
            return categoryKey;
          }
        }
      }
    }
    
    // Check remaining categories (if any new ones added)
    for (const [key, category] of Object.entries(CATEGORY_DEFINITIONS)) {
      if (!priorityOrder.includes(key)) {
        for (const domain of category.domains) {
          if (hostname.includes(domain.toLowerCase())) {
            return key;
          }
        }
      }
    }
  } catch (e) {
    console.error("Failed to categorize URL:", e);
  }
  
  return "miscellaneous";
}

export default function Dashboard() {
  console.log("Dashboard rendering, Globe is:", Globe);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<PageMemory | null>(null);
  const [memories, setMemories] = useState<PageMemory[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [storageSize, setStorageSize] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [captureEnabled, setCaptureEnabled] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const {
    isAvailable,
    isChecking,
    getAllPages,
    getStats,
    searchMemory,
    getCaptureSettings,
    updateCaptureSettings,
    getAnalytics,
    sendMessage,
  } = useExtension();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load data from Extension
  const loadData = useCallback(async () => {
    if (!isAvailable) return;
    
    try {
      // Parallelize all initial requests for maximum speed
      const [stats, settings, nodes] = await Promise.all([
        getStats().catch(err => { console.error("Stats fail:", err); return null; }),
        getCaptureSettings().catch(err => { console.error("Settings fail:", err); return null; }),
        debouncedQuery.trim() 
          ? searchMemory(debouncedQuery).catch(err => { console.error("Search fail:", err); return []; })
          : getAllPages().catch(err => { console.error("Pages fail:", err); return []; })
      ]);

      if (stats) {
        setPageCount(stats.pageCount);
        setStorageSize(stats.storageSize);
      }

      if (settings) {
        setCaptureEnabled(settings.enabled);
      }

      if (nodes && Array.isArray(nodes)) {
        const formattedMemories: PageMemory[] = nodes.map((node: any) => {
          // Generate reason data if not present (for non-search results or missing data)
          let reason = node.reason;
          if (!reason) {
            if (debouncedQuery.trim() && node.similarity !== undefined) {
              // Create reason data for search results that might be missing it
              reason = {
                sharedKeywords: (node.keywords || []).filter((kw: string) => 
                  debouncedQuery.toLowerCase().includes(kw.toLowerCase())
                ),
                contextMatch: generateContextMatchReason(debouncedQuery, node),
                semanticSimilarity: node.similarity || 1.0
              };
            } else {
              // For non-search results, create a basic reason
              reason = {
                sharedKeywords: [],
                contextMatch: "Saved page",
                semanticSimilarity: 1.0
              };
            }
          }
          
          return {
            id: node.id,
            url: node.url,
            title: node.title,
            // Use snippet if available (from GET_ALL_PAGES), fallback to readableText (from SEARCH_MEMORY)
            snippet: node.snippet || (node.readableText ? node.readableText.slice(0, 200) : ""),
            timestamp: new Date(node.timestamp).toLocaleString(),
            similarity: node.similarity || 1.0,
            keywords: node.keywords || [],
            domain: node.metadata?.domain || "",
            category: categorizeUrl(node.url),
            reason: reason
          };
        });

        setMemories(formattedMemories);
      } else {
        setMemories([]);
      }
    } catch (err) {
      console.error("Dashboard: Critical failure loading data:", err);
    }
  }, [getAllPages, getStats, searchMemory, getCaptureSettings, debouncedQuery, isAvailable]);

  // Initial load and reload when query changes - prevent infinite loop
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAvailable) {
      setIsLoading(false);
      return;
    }
    
    // Always load on initial mount (lastQuery is null) or when query actually changed
    if (lastQuery === null || debouncedQuery !== lastQuery) {
      setIsLoading(true);
      setLastQuery(debouncedQuery);
      loadData().finally(() => {
        setIsLoading(false);
      });
    }
  }, [debouncedQuery, isAvailable, loadData, lastQuery]);

  // Load analytics when analytics tab is active - prevent infinite loop
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);
  
  useEffect(() => {
    if (activeTab === "analytics" && isAvailable && !analyticsLoading && !analyticsLoaded) {
      setAnalyticsLoading(true);
      getAnalytics()
        .then((data) => {
          if (data) {
            setAnalytics(data);
            setAnalyticsLoaded(true);
          }
          setAnalyticsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load analytics:", err);
          setAnalyticsLoading(false);
        });
    }
    
    // Reset loaded state when switching away from analytics tab
    if (activeTab !== "analytics") {
      setAnalyticsLoaded(false);
    }
  }, [activeTab, isAvailable, getAnalytics, analyticsLoading, analyticsLoaded]);

  // Separate effect for periodic refresh (only when not searching) - reduced frequency
  useEffect(() => {
    if (!isAvailable || debouncedQuery.trim()) {
      return; // Don't poll when searching or extension unavailable
    }

    // Reduced polling interval to 15s to prevent spam
    const interval = setInterval(() => {
      if (!isLoading) { // Only poll if not currently loading
        loadData().catch(err => {
          console.error("Dashboard: Error in polling", err);
        });
      }
    }, 15000); // 15 seconds
    
    return () => clearInterval(interval);
  }, [loadData, isAvailable, debouncedQuery, isLoading]);

  // Generate clusters by category
  const clusters = useMemo<Cluster[]>(() => {
    const categoryMap = new Map<string, PageMemory[]>();
    
    memories.forEach((memory) => {
      const category = memory.category || "miscellaneous";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(memory);
    });

    const generatedClusters: Cluster[] = [];
    
    for (const [key, definition] of Object.entries(CATEGORY_DEFINITIONS)) {
      const pages = categoryMap.get(key) || [];
      if (pages.length > 0) {
        generatedClusters.push({
          id: key,
          name: definition.name,
          color: definition.color,
          itemCount: pages.length,
          pages: pages.slice(0, 5),
          description: definition.description
        });
      }
    }

    const miscPages = categoryMap.get("miscellaneous") || [];
    if (miscPages.length > 0) {
      generatedClusters.push({
        id: "miscellaneous",
        name: "Miscellaneous",
        color: "from-gray-500 to-gray-600",
        itemCount: miscPages.length,
        pages: miscPages.slice(0, 5),
        description: "Websites not in the above categories"
      });
    }

    return generatedClusters.sort((a, b) => b.itemCount - a.itemCount);
  }, [memories]);

  const formatStorageSize = (bytes: number) => {
    if (bytes === 0) return "0.0 MB";
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + " MB";
  };

  const handleExport = () => {
    const data = JSON.stringify(memories, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cortex-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleCapture = async () => {
    const newState = !captureEnabled;
    setCaptureEnabled(newState);
    await updateCaptureSettings({ enabled: newState });
  };

  const filteredMemories = useMemo(() => {
    // If we have a query, memories are already fetched from the searchMemory service
    // which handles semantic search. We don't want to filter them further with
    // a simple string match as it might break semantic search results.
    return memories;
  }, [memories]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground relative overflow-hidden">
      <div className="main-bg" />
      <Header />

      {!isAvailable && !isChecking && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-4 text-amber-800 dark:text-amber-200 shadow-xl">
            <HelpCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-bold mb-2">Cortex Extension Not Connected</div>
              <div className="text-xs leading-relaxed space-y-2">
                <p>Make sure the Cortex extension is installed and enabled in your browser.</p>
                <div className="flex gap-2">
                  <button onClick={() => window.location.reload()} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors">
                    Refresh Page
                  </button>
                  <a href="chrome://extensions" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg text-xs font-medium transition-colors">
                    Manage Extensions
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isChecking && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-4 text-blue-800 dark:text-blue-200 shadow-xl">
            <Loader className="w-5 h-5 animate-spin shrink-0" />
            <div className="text-sm font-medium">Connecting to Cortex extension...</div>
          </div>
        </div>
      )}

      <div className="flex relative z-10">
        {sidebarOpen && (
          <aside className="hidden lg:flex w-72 h-[calc(100vh-64px)] flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
              <div>
                <h2 className="text-xs font-bold tracking-wider text-slate-400 mb-6 uppercase">Menu</h2>
                <nav className="space-y-1">
                  <button onClick={() => { setActiveTab("search"); setSelectedCategoryFilter(null); }} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "search" ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <Search className="w-4 h-4 mr-3" />
                    Smart Search
                  </button>
                  <button onClick={() => { setActiveTab("clusters"); setSelectedCategoryFilter(null); }} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "clusters" ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <Sidebar className="w-4 h-4 mr-3" />
                    Auto Groups ({clusters.length})
                  </button>
                  <button onClick={() => { setActiveTab("analytics"); setSelectedCategoryFilter(null); }} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "analytics" ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Analytics
                  </button>
                  <button onClick={() => { setActiveTab("settings"); setSelectedCategoryFilter(null); }} className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === "settings" ? "bg-primary text-primary-foreground shadow-sm" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                    <Settings className="w-4 h-4 mr-3" />
                    Safe & Private
                  </button>
                </nav>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h2 className="text-xs font-bold tracking-wider text-slate-400 mb-2 uppercase">Your Stats</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Storage Used</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatStorageSize(storageSize)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Saved Pages</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{pageCount}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Categories</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{clusters.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 mb-6 border border-blue-100 dark:border-blue-800">
                <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  <span className="font-bold">Did you know?</span> Cortex organizes your web life automatically so you never lose a link again.
                </p>
              </div>
              <button 
                onClick={() => alert("Cortex uses local semantic search to help you find your browsing history by meaning. Your data never leaves your device.")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                How it works
              </button>
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0">
          <div className="flex-1 p-8 lg:p-12 overflow-y-auto h-[calc(100vh-64px)]">
            {activeTab === "search" ? (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-3">
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      Your <span className="text-primary">Memories.</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                      Search through everything you've seen online. Cortex remembers the details so you don't have to.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={loadData} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all text-slate-500 shadow-sm">
                      <Loader className={`w-5 h-5 ${isLoading ? "animate-spin text-primary" : ""}`} />
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                      <Download className="w-4 h-4" />
                      Backup
                    </button>
                  </div>
                </div>

                <div className="relative group max-w-3xl">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by keyword, topic, or semantic meaning..."
                    className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-lg font-medium shadow-sm focus:outline-none focus:border-primary transition-all placeholder:text-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {debouncedQuery && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      Semantic Search Active
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                  {isLoading && memories.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                      <Loader className="w-10 h-10 text-primary animate-spin" />
                      <p className="text-slate-500 font-medium">Loading memories...</p>
                    </div>
                  ) : filteredMemories.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Search className="w-8 h-8" />
                      </div>
                      <p className="text-slate-500 font-medium">No memories found. Try a different search or browse some pages.</p>
                    </div>
                  ) : (
                    filteredMemories.map((memory) => (
                      <div
                        key={memory.id}
                        onClick={() => setSelectedMemory(memory)}
                        className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_DEFINITIONS[memory.category as keyof typeof CATEGORY_DEFINITIONS]?.color || "from-slate-400 to-slate-500"} flex items-center justify-center text-white shadow-sm`}>
                            <Globe className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors flex-1">
                                {memory.title}
                              </h3>
                              {/* Always show info button, generate reason if missing */}
                              {(() => {
                                const reason = memory.reason || {
                                  sharedKeywords: [],
                                  contextMatch: memory.similarity < 1.0 ? "Semantic match" : "Saved page",
                                  semanticSimilarity: memory.similarity || 1.0
                                };
                                
                                return (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          onClick={(e) => e.stopPropagation()}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                        >
                                          <Info className="w-4 h-4 text-slate-400 hover:text-primary" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="left" className="max-w-xs p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
                                        <div className="space-y-3">
                                          <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Match Score</p>
                                            <p className="text-2xl font-black text-primary">{Math.round((memory.similarity || 1.0) * 100)}%</p>
                                          </div>
                                          <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Why This Result?</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">{reason.contextMatch || "Saved page"}</p>
                                          </div>
                                          {reason.sharedKeywords && reason.sharedKeywords.length > 0 && (
                                            <div>
                                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Shared Keywords</p>
                                              <div className="flex flex-wrap gap-1">
                                                {reason.sharedKeywords.map((kw: string) => (
                                                  <span key={kw} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold uppercase">
                                                    {kw}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })()}
                            </div>
                            <p className="text-xs text-slate-400 truncate font-medium">
                              {memory.domain}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                          {memory.snippet}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                          <div className="flex gap-1.5">
                            {memory.keywords.slice(0, 2).map((kw) => (
                              <span key={kw} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                {kw}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            {new Date(memory.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : activeTab === "clusters" ? (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {selectedCategoryFilter ? (
                          <>
                            {CATEGORY_DEFINITIONS[selectedCategoryFilter as keyof typeof CATEGORY_DEFINITIONS]?.name || selectedCategoryFilter}
                            <span className="text-primary">.</span>
                          </>
                        ) : (
                          <>
                            Auto <span className="text-primary">Groups.</span>
                          </>
                        )}
                      </h1>
                      <p className="text-lg text-slate-500 max-w-2xl leading-relaxed mt-2">
                        {selectedCategoryFilter 
                          ? `Showing all pages in this category`
                          : `Your browsing organized into ${clusters.length} smart categories based on website types and content.`
                        }
                      </p>
                    </div>
                    {selectedCategoryFilter && (
                      <button
                        onClick={() => setSelectedCategoryFilter(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm font-medium text-slate-600 dark:text-slate-400"
                      >
                        ← Back to Groups
                      </button>
                    )}
                  </div>
                </div>

                {selectedCategoryFilter ? (
                  // Show filtered pages for selected category
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                    {memories
                      .filter((memory) => memory.category === selectedCategoryFilter)
                      .map((memory) => (
                        <div
                          key={memory.id}
                          onClick={() => setSelectedMemory(memory)}
                          className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CATEGORY_DEFINITIONS[memory.category as keyof typeof CATEGORY_DEFINITIONS]?.color || "from-slate-400 to-slate-500"} flex items-center justify-center text-white shadow-sm`}>
                              <Globe className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                {memory.title}
                              </h3>
                              <p className="text-xs text-slate-400 truncate font-medium">
                                {memory.domain}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">
                            {memory.snippet}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex gap-1.5">
                              {memory.keywords.slice(0, 2).map((kw) => (
                                <span key={kw} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  {kw}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              <Clock className="w-3 h-3" />
                              {new Date(memory.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    {memories.filter((memory) => memory.category === selectedCategoryFilter).length === 0 && (
                      <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                          <Sidebar className="w-8 h-8" />
                        </div>
                        <p className="text-slate-500 font-medium">No pages found in this category.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Show category clusters
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  {isLoading && clusters.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                      <Loader className="w-10 h-10 text-primary animate-spin" />
                      <p className="text-slate-500 font-medium">Categorizing your web life...</p>
                    </div>
                  ) : clusters.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Sidebar className="w-8 h-8" />
                      </div>
                      <p className="text-slate-500 font-medium">Auto Groups appear once you start browsing and saving pages.</p>
                    </div>
                  ) : (
                    clusters.map((cluster) => (
                      <div key={cluster.id} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all">
                        <div className={`h-3 bg-gradient-to-r ${cluster.color}`} />
                        <div className="p-8 space-y-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{cluster.name}</h3>
                              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold uppercase text-slate-500">
                                {cluster.itemCount} Page{cluster.itemCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500">{cluster.description}</p>
                          </div>
                          <div className="space-y-3">
                            {cluster.pages.map((page) => (
                              <a key={page.id} href={page.url} target="_blank" rel="noopener noreferrer" className="flex items-center group/link" title={page.title}>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/link:bg-primary mr-3 transition-all" />
                                <span className="text-sm text-slate-500 group-hover/link:text-primary transition-colors truncate">{page.title}</span>
                              </a>
                            ))}
                            {cluster.itemCount > 5 && (
                              <p className="text-xs text-slate-400 mt-1">+ {cluster.itemCount - 5} more pages</p>
                            )}
                          </div>
                          <button onClick={() => setSelectedCategoryFilter(cluster.id)} className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                            View All Pages
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  </div>
                )}
              </div>
            ) : activeTab === "analytics" ? (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="space-y-3">
                  <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Your <span className="text-primary">Analytics.</span>
                  </h1>
                  <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                    Insights into your browsing patterns, top sites, and categories over time.
                  </p>
                </div>

                {analyticsLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-slate-500 font-medium">Loading analytics...</p>
                  </div>
                ) : analytics ? (
                  <div className="space-y-8 pb-20">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Pages</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{analytics.totalPages.toLocaleString()}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Unique Sites</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{analytics.uniqueDomains.toLocaleString()}</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date Range</p>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                          {new Date(analytics.dateRange.start).toLocaleDateString()} - {new Date(analytics.dateRange.end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Daily Stats */}
                    {analytics.daily && analytics.daily.length > 0 && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Daily Activity</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {analytics.daily.slice(-30).map((day: any) => (
                            <div key={day.date} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{day.date}</span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${Math.min(100, (day.count / Math.max(...analytics.daily.map((d: any) => d.count))) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white w-12 text-right">{day.count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Monthly Stats */}
                    {analytics.monthly && analytics.monthly.length > 0 && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Monthly Activity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {analytics.monthly.map((month: any) => (
                            <div key={month.month} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{month.month}</p>
                              <p className="text-2xl font-black text-slate-900 dark:text-white">{month.count.toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Sites */}
                    {analytics.topSites && analytics.topSites.length > 0 && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Top Sites</h3>
                        <div className="space-y-3">
                          {analytics.topSites.slice(0, 10).map((site: any, index: number) => (
                            <div key={site.domain} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-sm shrink-0">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-900 dark:text-white truncate">{site.domain}</p>
                                  <p className="text-xs text-slate-400">Last visit: {new Date(site.lastVisit).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm font-bold text-slate-900 dark:text-white">{site.count.toLocaleString()}</p>
                                  <p className="text-xs text-slate-400">{site.percentage.toFixed(1)}%</p>
                                </div>
                                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${site.percentage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Categories */}
                    {analytics.topCategories && analytics.topCategories.length > 0 && (
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Top Categories</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analytics.topCategories.map((cat: any) => {
                            const categoryKey = cat.category;
                            const categoryDef = CATEGORY_DEFINITIONS[categoryKey as keyof typeof CATEGORY_DEFINITIONS];
                            const categoryName = categoryDef?.name || (categoryKey === "miscellaneous" ? "Miscellaneous" : categoryKey);
                            const categoryColor = categoryDef?.color || "from-slate-400 to-slate-500";
                            
                            return (
                              <div key={cat.category} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${categoryColor} flex items-center justify-center text-white text-xs font-black`}>
                                      {categoryName.charAt(0)}
                                    </div>
                                    <p className="font-bold text-slate-900 dark:text-white">{categoryName}</p>
                                  </div>
                                  <p className="text-sm font-bold text-primary">{cat.percentage.toFixed(1)}%</p>
                                </div>
                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${categoryColor} rounded-full transition-all`}
                                    style={{ width: `${cat.percentage}%` }}
                                  />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{cat.count.toLocaleString()} pages</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <BarChart3 className="w-8 h-8" />
                    </div>
                    <p className="text-slate-500 font-medium">No analytics data available yet. Start browsing to see your insights!</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="space-y-3">
                  <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Safe & <span className="text-primary">Private.</span>
                  </h1>
                  <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                    Everything stays on your device. We never send your browsing data to any servers. You're in total control.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Pause className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pause Collection</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Temporarily stop Cortex from saving new pages. Your existing memories will remain safe and accessible.
                      </p>
                    </div>
                    <button 
                      onClick={handleToggleCapture}
                      className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        captureEnabled 
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" 
                          : "bg-primary text-primary-foreground shadow-lg hover:opacity-90"
                      }`}
                    >
                      {captureEnabled ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause Capturing
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Resume Capturing
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <Download className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Export My Data</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Download your entire browsing history and semantic graph in a portable JSON format for backup.
                      </p>
                    </div>
                    <button 
                      onClick={handleExport}
                      className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Backup (.json)
                    </button>
                  </div>

                  <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Clear All Data</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Permanently delete all your saved pages and indexing data. This action cannot be undone.
                      </p>
                    </div>
                    <button 
                      onClick={async () => {
                        if (confirm("Are you sure you want to clear all your data? This cannot be undone.")) {
                          const response = await sendMessage({ type: "FORGET_DATA", payload: {} });
                          if (response.success) {
                            alert("All data has been cleared.");
                            window.location.reload();
                          } else {
                            alert("Failed to clear data: " + response.error);
                          }
                        }
                      }}
                      className="w-full py-4 rounded-xl border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Wipe Everything
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>{/* End main container */}

      {selectedMemory && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${CATEGORY_DEFINITIONS[selectedMemory.category as keyof typeof CATEGORY_DEFINITIONS]?.color || "from-slate-400 to-slate-500"} flex items-center justify-center text-white`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[300px]">{selectedMemory.title}</h3>
                  <p className="text-xs text-slate-400">{selectedMemory.domain}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMemory(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">About this page</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                  "{selectedMemory.snippet}..."
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saved On</h4>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{selectedMemory.timestamp}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search Match</h4>
                  <p className="text-sm font-black text-primary">{Math.round(selectedMemory.similarity * 100)}% Match Score</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMemory.keywords.map(kw => (
                    <span key={kw} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button 
                onClick={() => window.open(selectedMemory.url, '_blank')}
                className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Website
              </button>
              <button 
                onClick={async () => {
                  if (confirm("Remove this memory forever?")) {
                    const response = await sendMessage({ type: "FORGET_DATA", payload: { domain: selectedMemory.domain } });
                    if (response.success) {
                      setMemories(prev => prev.filter(m => m.id !== selectedMemory.id));
                      setSelectedMemory(null);
                    }
                  }
                }}
                className="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}