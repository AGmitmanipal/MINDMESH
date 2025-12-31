/**
 * AutonomousBrowsingAgent
 *
 * A lightweight finite-state browsing loop:
 * plan → act → observe → score → continue/stop
 *
 * Guardrails:
 * - allowlist domains
 * - action/navigation/click/depth budgets
 * - per-step timeout and retries (delegated to BrowserController)
 * - JS error capture (content script sends AGENT_JS_ERROR; background persists as logs)
 */

import type {
  AgentAction,
  AgentDomSnapshot,
  AgentLogEntry,
  AgentRunState,
  AgentRunStatus,
  AgentSettings,
  MemoryNode,
} from "@shared/extension-types";
import { cortexStorage } from "../utils/storage";
import { browserController } from "./browser-controller";
import { generateEmbedding } from "../utils/embedding";
import { extractKeywords } from "@/lib/text-utils";

function now() {
  return Date.now();
}

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function normalizeDomain(d: string): string {
  return d.trim().toLowerCase().replace(/^\*\./, "");
}

function isAllowedByAllowlist(url: string, allowlistDomains: string[]): boolean {
  if (!allowlistDomains || allowlistDomains.length === 0) return true;
  const host = normalizeDomain(safeDomain(url));
  if (!host) return false;
  return allowlistDomains.map(normalizeDomain).some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d));
}

function tokenizeGoal(goal: string): string[] {
  return goal
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter((t) => t.length >= 3)
    .slice(0, 20);
}

function scoreSnapshot(goalTerms: string[], snap: AgentDomSnapshot): number {
  const hay = `${snap.title} ${snap.metaDescription || ""} ${snap.mainText || ""}`.toLowerCase();
  if (goalTerms.length === 0) return 0;
  let hit = 0;
  for (const t of goalTerms) if (hay.includes(t)) hit++;
  return hit / goalTerms.length;
}

function scoreLink(goalTerms: string[], text: string, href: string): number {
  const hay = `${text} ${href}`.toLowerCase();
  let score = 0;
  for (const t of goalTerms) {
    if (hay.includes(t)) score += 1;
  }
  // slight preference for non-empty anchor text
  if (text.trim().length > 0) score += 0.25;
  return score;
}

export class AutonomousBrowsingAgent {
  private status: AgentRunStatus = { runId: null, state: "idle" };
  private stopRequested = false;
  private visited = new Set<string>();
  private lastSnapshot: AgentDomSnapshot | null = null;
  private goalTerms: string[] = [];

  getStatus(): AgentRunStatus {
    return { ...this.status };
  }

  async start(goal: string, startUrl?: string, tabId?: number): Promise<AgentRunStatus> {
    const settings = await cortexStorage.getAgentSettings();
    if (!settings.enabled) {
      throw new Error("Autonomous browsing is disabled in Agent settings");
    }
    if (this.status.state !== "idle" && this.status.state !== "stopped" && this.status.state !== "completed" && this.status.state !== "error") {
      throw new Error("Agent is already running");
    }

    this.stopRequested = false;
    this.visited.clear();
    this.lastSnapshot = null;
    this.goalTerms = tokenizeGoal(goal);

    const runId = id("run");
    const resolvedTabId = await browserController.ensureTabId(tabId, undefined);

    this.status = {
      runId,
      state: "planning",
      goal,
      startedAt: now(),
      updatedAt: now(),
      tabId: resolvedTabId,
      depth: 0,
      actionsTaken: 0,
      navigations: 0,
      clicks: 0,
    };

    await this.log("info", "Agent run started", { goal, startUrl, tabId: resolvedTabId, settings: this.safeSettingsForLog(settings) });

    // Kick off loop (do not block message handler)
    this.loop(settings, startUrl).catch(async (e) => {
      await this.fail(e);
    });

    return this.getStatus();
  }

  async stop(runId?: string): Promise<AgentRunStatus> {
    if (runId && this.status.runId && runId !== this.status.runId) return this.getStatus();
    this.stopRequested = true;
    await this.transition("stopped");
    await this.log("warn", "Agent stop requested");
    return this.getStatus();
  }

  async onJsError(payload: any): Promise<void> {
    // JS errors can be noisy; keep them as warn-level logs.
    if (!this.status.runId) return;
    await this.log("warn", "Page JS error captured", payload || {});
  }

  private safeSettingsForLog(settings: AgentSettings) {
    // Avoid dumping large objects; keep what matters.
    return {
      enabled: settings.enabled,
      dryRun: settings.dryRun,
      allowlistDomains: settings.allowlistDomains,
      perStepTimeoutMs: settings.perStepTimeoutMs,
      retries: settings.retries,
      budgets: settings.budgets,
      logDomTextMaxChars: settings.logDomTextMaxChars,
    };
  }

  private async transition(state: AgentRunState, extra?: Partial<AgentRunStatus>) {
    this.status = {
      ...this.status,
      state,
      updatedAt: now(),
      ...(extra || {}),
    };
  }

  private async log(level: AgentLogEntry["level"], message: string, data?: Record<string, unknown>) {
    const runId = this.status.runId;
    if (!runId) return;
    const entry: AgentLogEntry = {
      id: id("alog"),
      runId,
      level,
      message,
      timestamp: now(),
      data: data || {},
    };
    await cortexStorage.addAgentLog(entry);
    // Also echo to console for easy debugging during development.
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(`Agent[${runId}] ${message}`, data || "");
  }

  private async fail(e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    await this.transition("error", { lastError: msg });
    await this.log("error", "Agent failed", { error: msg });
  }

  private budgetsExceeded(settings: AgentSettings): string | null {
    const depth = this.status.depth || 0;
    const actions = this.status.actionsTaken || 0;
    const nav = this.status.navigations || 0;
    const clicks = this.status.clicks || 0;

    if (depth >= settings.budgets.maxDepth) return "maxDepth reached";
    if (actions >= settings.budgets.maxActions) return "maxActions reached";
    if (nav >= settings.budgets.navigationBudget) return "navigationBudget reached";
    if (clicks >= settings.budgets.clickBudget) return "clickBudget reached";
    return null;
  }

  private async storeStepMemory(settings: AgentSettings, snapshot: AgentDomSnapshot, action?: AgentAction) {
    const runId = this.status.runId!;
    const step = (this.status.actionsTaken || 0) + 1;
    const url = snapshot.url;
    const domain = safeDomain(url);

    const readableText = (snapshot.mainText || "").slice(0, settings.logDomTextMaxChars);
    const keywords = extractKeywords(readableText, snapshot.title);
    const embeddingResult = generateEmbedding(readableText, snapshot.title, keywords);

    const nodeId = `agent_${runId}_${step}`;
    const node: MemoryNode = {
      id: nodeId,
      url,
      title: snapshot.title,
      readableText,
      timestamp: now(),
      keywords,
      embedding: {
        vector: embeddingResult.vector,
        model: "fallback",
        timestamp: now(),
      },
      metadata: {
        domain,
        tabId: this.status.tabId,
        agent: {
          runId,
          step,
          actionType: action?.type,
          actionId: action?.id,
        },
      },
    };

    await Promise.all([cortexStorage.addMemoryNode(node), cortexStorage.storeEmbedding(nodeId, node.embedding!)]);
  }

  private planNextAction(settings: AgentSettings, goal: string): AgentAction | null {
    const tabId = this.status.tabId;
    if (typeof tabId !== "number") return null;

    // First step: navigate if startUrl provided by loop; otherwise just extract from current tab.
    if (!this.lastSnapshot) {
      return {
        id: id("act"),
        type: "extract_dom",
        data: { tabId },
      };
    }

    const links = this.lastSnapshot.links || [];
    const candidates = links
      .filter((l) => Boolean(l.href))
      .filter((l) => !l.href.includes("#"))
      .filter((l) => !this.visited.has(l.href))
      .filter((l) => isAllowedByAllowlist(l.href, settings.allowlistDomains));

    if (candidates.length === 0) return null;

    const ranked = candidates
      .map((l) => ({ l, s: scoreLink(this.goalTerms, l.text || "", l.href) }))
      .sort((a, b) => b.s - a.s);

    const best = ranked[0]?.l;
    if (!best) return null;

    // Deterministic preference: navigate directly to href (more stable than clicks)
    return {
      id: id("act"),
      type: "navigate",
      data: { tabId, url: best.href, reason: "top_scored_link", anchorText: best.text || "" },
    };
  }

  private async loop(settings: AgentSettings, startUrl?: string) {
    const runId = this.status.runId!;
    const tabId = this.status.tabId!;
    const goal = this.status.goal || "";

    // Optional initial navigation
    if (startUrl) {
      if (!isAllowedByAllowlist(startUrl, settings.allowlistDomains)) {
        throw new Error(`Start URL blocked by allowlist: ${startUrl}`);
      }

      await this.transition("acting");
      await this.log("info", "Initial navigation", { url: startUrl });
      if (!settings.dryRun) {
        await browserController.navigate(tabId, startUrl, settings.perStepTimeoutMs);
      }
      this.status.navigations = (this.status.navigations || 0) + 1;
    }

    while (!this.stopRequested) {
      const budgetReason = this.budgetsExceeded(settings);
      if (budgetReason) {
        await this.log("warn", "Stopping: budget reached", { reason: budgetReason });
        await this.transition("completed");
        return;
      }

      await this.transition("planning");
      const action = this.planNextAction(settings, goal);
      if (!action) {
        await this.log("info", "Stopping: no viable next actions", { visited: this.visited.size });
        await this.transition("completed");
        return;
      }

      await this.transition("acting");
      await this.log("info", "Action planned", { action });

      // Act (with guardrails)
      if (action.type === "navigate") {
        const url = String(action.data.url || "");
        if (!url) throw new Error("Navigate action missing url");
        if (!isAllowedByAllowlist(url, settings.allowlistDomains)) {
          await this.log("warn", "Blocked by allowlist", { url });
        } else if (!settings.dryRun) {
          await browserController.navigate(tabId, url, settings.perStepTimeoutMs);
        }
        this.status.navigations = (this.status.navigations || 0) + 1;
        this.visited.add(url);
        this.status.depth = (this.status.depth || 0) + 1;
      } else if (action.type === "extract_dom") {
        // no-op in act
      } else {
        // Reserved for future extensions (click/type/fill/etc)
        await this.log("warn", "Unsupported action type (ignored)", { actionType: action.type });
      }

      this.status.actionsTaken = (this.status.actionsTaken || 0) + 1;

      await this.transition("observing");
      const snapshot = await browserController.extractDomSnapshot(tabId, settings.perStepTimeoutMs);
      this.lastSnapshot = snapshot;

      const relevance = scoreSnapshot(this.goalTerms, snapshot);
      await this.log("info", "Observation captured", {
        url: snapshot.url,
        title: snapshot.title,
        relevance,
        snippet: snapshot.snippet || "",
      });

      // Persist as a memory node ("memory node per visited step")
      await this.storeStepMemory(settings, snapshot, action);

      // Simple stop heuristic: if highly relevant, stop early
      if (relevance >= 0.85) {
        await this.log("info", "Stopping: high relevance achieved", { relevance });
        await this.transition("completed");
        return;
      }

      // Give the page a moment to settle for SPA content changes
      await new Promise((r) => setTimeout(r, 250));
    }

    await this.log("warn", "Stopped by user");
    await this.transition("stopped");
    console.log(`Agent[${runId}] stopped`);
  }
}

export const autonomousBrowsingAgent = new AutonomousBrowsingAgent();


