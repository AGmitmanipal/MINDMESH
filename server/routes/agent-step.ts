import type { RequestHandler } from "express";
import { z } from "zod";

const ActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("open_tab"),
    data: z.object({ url: z.string().min(1) }).passthrough(),
  }),
  z.object({
    type: z.literal("navigate"),
    data: z.object({ url: z.string().min(1), tabId: z.number().optional() }).passthrough(),
  }),
  z.object({
    type: z.literal("click"),
    data: z
      .object({
        tabId: z.number().optional(),
        selector: z.string().min(1).optional(),
        text: z.string().min(1).optional(),
      })
      .passthrough()
      .refine((d) => Boolean(d.selector || d.text), "click requires selector or text"),
  }),
  z.object({
    type: z.literal("fill_form"),
    data: z
      .object({
        tabId: z.number().optional(),
        fields: z.record(z.string()).refine((r) => Object.keys(r).length > 0, "fields must have at least 1 entry"),
      })
      .passthrough(),
  }),
  z.object({
    type: z.literal("extract"),
    // used by the client to fetch a snapshot; we generally won't ask Gemini to do this directly
    data: z.object({ mode: z.string().optional(), selector: z.string().optional() }).passthrough(),
  }),
  z.object({
    type: z.literal("close_tab"),
    data: z.object({ tabId: z.number() }).passthrough(),
  }),
  z.object({
    type: z.literal("finish"),
    data: z.object({ reason: z.string().optional() }).passthrough(),
  }),
]);

const StepRequestSchema = z.object({
  goal: z.string().min(1),
  allowlistDomains: z.array(z.string()).optional().default([]),
  step: z.number().int().min(0).max(100).optional().default(0),
  history: z
    .array(
      z.object({
        action: z.any().optional(),
        result: z.any().optional(),
      })
    )
    .optional()
    .default([]),
  snapshot: z
    .object({
      url: z.string().optional(),
      title: z.string().optional(),
      text: z.string().optional(),
      links: z.array(z.object({ href: z.string(), text: z.string().optional() })).optional(),
    })
    .passthrough(),
});

// What we expect the MODEL to return (the server wraps it into { ok: true/false, ... })
const ModelStepSchema = z.object({
  done: z.boolean().optional().default(false),
  action: ActionSchema.optional(),
  reason: z.string().optional(),
});

function normalizeDomain(d: string): string {
  return d.trim().toLowerCase().replace(/^\*\./, "");
}

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function isAllowedByAllowlist(url: string, allowlistDomains: string[]): boolean {
  if (!allowlistDomains || allowlistDomains.length === 0) return true;
  const host = normalizeDomain(safeDomain(url));
  if (!host) return false;
  return allowlistDomains.map(normalizeDomain).some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d));
}

function isRestrictedUrl(url: string): boolean {
  const u = (url || "").toLowerCase();
  return u.startsWith("chrome://") || u.startsWith("chrome-extension://") || u.startsWith("edge://") || u.startsWith("about:") || u.startsWith("file://");
}

async function callGemini(params: {
  apiKey: string;
  model: string;
  goal: string;
  step: number;
  allowlistDomains: string[];
  snapshot: unknown;
  history: unknown[];
}): Promise<unknown> {
  const { apiKey, model, goal, step, allowlistDomains, snapshot, history } = params;

  const system = [
    "You are a browser automation planner.",
    "Return ONLY valid JSON with keys: done (boolean), action (object), reason (string, optional).",
    "Allowed action.type: open_tab, navigate, click, fill_form, close_tab, finish.",
    "Use click.data.selector when possible; otherwise click.data.text.",
    "Never request secrets or credentials. Avoid login flows.",
    "Keep selectors minimal and stable.",
  ].join("\n");

  const userPayload = {
    goal,
    step,
    allowlistDomains,
    snapshot,
    history,
  };

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(userPayload) }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Gemini HTTP ${resp.status}: ${text || resp.statusText}`);
  }

  const json = (await resp.json()) as any;
  const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("\n");
  if (!text) return json;

  try {
    return JSON.parse(text);
  } catch (err) {
    // Try to recover if the model wrapped the JSON in extra text (e.g. explanations)
    try {
      const m = text.match(/(\{[\s\S]*\})/);
      if (m && m[1]) {
        return JSON.parse(m[1]);
      }
    } catch { }

    // Emit a warning to help debugging and return the raw text for caller-side handling
    console.warn("callGemini: failed to parse model JSON response; returning raw text (truncated)",
      typeof text === "string" ? text.slice(0, 2000) : text);
    return { raw: text };
  }
}

async function callLocalModel(params: {
  model: string;
  goal: string;
  step: number;
  allowlistDomains: string[];
  snapshot: unknown;
  history: unknown[];
}): Promise<unknown> {
  // Attempt to use the local on-device adapter, but never throw — always return
  // a valid model-shaped response. If the adapter is missing or fails, fall
  // back to a deterministic planner that produces safe browser actions.
  try {
    const mod = await import("../local-model").catch(() => null as any);
    if (mod && typeof mod.generateStep === "function") {
      try {
        const raw = await mod.generateStep(params as any);
        if (raw) return raw;
      } catch (e) {
        console.warn("local-model.generateStep threw:", e?.message || e);
      }
    } else {
      console.warn("local-model adapter not found or invalid; falling back to deterministic planner");
    }
  } catch (e) {
    console.warn("callLocalModel import error:", e?.message || e);
  }

  // Deterministic planner fallback (server-side) — never fails.
  const goal = (params.goal || "").toString().trim();
  const lower = goal.toLowerCase();

  // Search-like goals: "search for X" or "find X" or "search X"
  const searchMatch = lower.match(/(?:search for|find|search)\s+(.{2,})/i);
  if (searchMatch) {
    const q = encodeURIComponent(searchMatch[1].trim());
    return {
      done: false,
      action: { type: "open_tab", data: { url: `https://www.google.com/search?q=${q}` } },
    };
  }

  // Price-filtered product search, e.g. "headphones under 5000 rupees"
  const priceMatch = lower.match(/(.{3,}?)\s+(?:under|below)\s+(\d{2,}(?:,\d{3})*)(?:\s*(rupees|inr|rs)?)?/i);
  if (priceMatch) {
    const item = encodeURIComponent(priceMatch[1].trim());
    const price = priceMatch[2].replace(/,/g, "");
    // Use Google search with price + site hints to let user refine locally.
    const q = encodeURIComponent(`${item} under ${price} rupees`);
    return {
      done: false,
      action: { type: "open_tab", data: { url: `https://www.google.com/search?q=${q}` } },
    };
  }

  // Open URL pattern
  const openMatch = lower.match(/open\s+(https?:\/\/)?([\w.-]+)(\/.+)?/i);
  if (openMatch) {
    const host = openMatch[2];
    const path = openMatch[3] || "";
    const url = `https://${host}${path}`;
    return { done: false, action: { type: "open_tab", data: { url } } };
  }

  // Fallback: finish with debug information but not an error.
  return { done: true, action: { type: "finish", data: { reason: "deterministic-fallback: no actionable plan", goal } } };
}

export const handleAgentStep: RequestHandler = async (req, res) => {
  const parsed = StepRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, done: true, reason: parsed.error.issues[0]?.message || "Invalid request" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = (process.env.MODEL_USED || "gemini-1.5-flash").toString();

  // Determine if the configured model name refers to a remote provider.
  const prefersRemote = /(gemini|gpt|openai|anthropic|claude|replicate|poe|perplexity|bard)/i.test(model);

  try {
    // Try local on-device model first. If it fails and a remote provider is allowed,
    // fall back to the remote call (requires an API key).
    let raw: unknown;
    try {
      raw = await callLocalModel({
        model,
        goal: parsed.data.goal,
        step: parsed.data.step,
        allowlistDomains: parsed.data.allowlistDomains,
        snapshot: parsed.data.snapshot,
        history: parsed.data.history,
      });
    } catch (localErr) {
      // Local model failed. If a remote provider is implied, try that as a fallback.
      if (prefersRemote) {
        if (!apiKey) {
          return res.status(500).json({ ok: false, done: true, reason: "Missing GEMINI_API_KEY on server for remote model fallback" });
        }
        raw = await callGemini({
          apiKey: apiKey as string,
          model,
          goal: parsed.data.goal,
          step: parsed.data.step,
          allowlistDomains: parsed.data.allowlistDomains,
          snapshot: parsed.data.snapshot,
          history: parsed.data.history,
        });
      } else {
        // No remote fallback configured — rethrow to be handled below.
        throw localErr;
      }
    }

    const candidate = ModelStepSchema.safeParse(raw);
    if (!candidate.success) {
      const short =
        typeof raw === "string"
          ? raw.slice(0, 500)
          : raw && typeof raw === "object"
            ? JSON.stringify(raw).slice(0, 500)
            : String(raw).slice(0, 500);
      return res.status(200).json({
        ok: false,
        done: true,
        reason: "Gemini returned invalid response shape",
        debug: short,
      });
    }

    const out = candidate.data;
    if (out.action?.type === "finish") {
      return res.json({ ok: true, done: true, reason: (out.action.data as any)?.reason || out.reason });
    }

    // Enforce allowlist + restricted URL safety on navigations.
    if (out.action && (out.action.type === "navigate" || out.action.type === "open_tab")) {
      const url = (out.action.data as any)?.url as string;
      if (isRestrictedUrl(url)) {
        return res.json({ ok: false, done: true, reason: `Blocked restricted URL: ${url}` });
      }
      if (!isAllowedByAllowlist(url, parsed.data.allowlistDomains)) {
        return res.json({ ok: false, done: true, reason: `Blocked by allowlist: ${url}` });
      }
    }

    return res.json({ ok: true, done: Boolean(out.done), action: out.action, reason: out.reason });
  } catch (e: any) {
    return res.status(500).json({ ok: false, done: true, reason: e?.message || "Agent step failed" });
  }
};


