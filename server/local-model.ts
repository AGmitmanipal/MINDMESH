import type { Pipeline } from "@xenova/transformers";

let generationPipeline: Pipeline | null = null;

function buildSystem(): string {
    return [
        "You are a browser automation planner.",
        "Return ONLY valid JSON with keys: done (boolean), action (object), reason (string, optional).",
        "Allowed action.type: open_tab, navigate, click, fill_form, close_tab, finish.",
        "Use click.data.selector when possible; otherwise click.data.text.",
        "Never request secrets or credentials. Avoid login flows.",
        "Keep selectors minimal and stable.",
    ].join("\n");
}

async function ensureGenerationPipeline(modelName = "gpt2") {
    if (generationPipeline) return generationPipeline;

    try {
        const { pipeline } = await import("@xenova/transformers");
        // Load a small, widely-available model by default. Users can override via MODEL_USED env.
        generationPipeline = await pipeline("text-generation", modelName, {
            progress_callback: undefined,
        }) as unknown as Pipeline;
        return generationPipeline;
    } catch (err) {
        generationPipeline = null;
        throw err;
    }
}

function deterministicPlanner(params: {
    model: string;
    goal: string;
    step: number;
    allowlistDomains: string[];
    snapshot: unknown;
    history: unknown[];
}) {
    const goalRaw = (params.goal || "").toString().trim();
    const goal = goalRaw.toLowerCase();

    // Multi-step automation behaviour based on params.step:
    // step=0 -> open the appropriate URL/search
    // step=1 -> try to click first meaningful result on that page
    // step=2 -> extract page text/details or finish
    const stepNum = Number(params.step || 0);
    const urlRegex = /(?:https?:\/\/[^\s]+|(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?)/i;
    const urlFound = goalRaw.match(urlRegex);

    // Helper: build google search URL (optionally with site hint)
    const makeGoogleSearch = (q: string, siteHint?: string) => {
        const full = q + (siteHint ? ` ${siteHint}` : "");
        return `https://www.google.com/search?q=${encodeURIComponent(full)}`;
    };

    // Helper: amazon search URL (use .in by default)
    const makeAmazonSearch = (q: string) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`;

    // Patterns
    const searchMatch = goal.match(/(?:search for|find|search)\s+(.{2,})/i);
    const amazonMatch = goal.match(/(?:on\s+)?(amazon(?:\.in|\.com|\.co\.uk|\.de|\.ca)?)\b/i);
    const priceMatch = goal.match(/(.{3,}?)\s+(?:under|below)\s+(\d{2,}(?:,\d{3})*)(?:\s*(rupees|inr|rs)?)?/i);

    // If a plain URL/hostname is present, handle navigation and follow-up steps
    if (urlFound) {
        let url = urlFound[0];
        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
        if (stepNum === 0) return { done: false, action: { type: "open_tab", data: { url } } };
        if (stepNum === 1) return { done: false, action: { type: "click", data: { selector: "a[href]:not([role])" } } };
        return { done: true, action: { type: "finish", data: { reason: "completed deterministic navigation", url } } };
    }

    // AMAZON SEARCH FLOW
    if (searchMatch && amazonMatch) {
        const query = searchMatch[1].trim();
        if (stepNum === 0) {
            // open amazon search for the query
            return { done: false, action: { type: "open_tab", data: { url: makeAmazonSearch(query) } } };
        }
        if (stepNum === 1) {
            // click first search result item
            return { done: false, action: { type: "click", data: { selector: 'div[data-component-type="s-search-result"] h2 a' } } };
        }
        if (stepNum === 2) {
            // extract page text (product title and price) - let client handle parsing
            return { done: false, action: { type: "extract", data: { mode: "text" } } };
        }
        return { done: true, action: { type: "finish", data: { reason: "amazon deterministic flow complete" } } };
    }

    // Generic search with price handling (no site specified)
    if (priceMatch) {
        const item = priceMatch[1].trim();
        const price = priceMatch[2].replace(/,/g, "");
        const full = `${item} under ${price} rupees`;
        if (stepNum === 0) return { done: false, action: { type: "open_tab", data: { url: makeGoogleSearch(full) } } };
        if (stepNum === 1) return { done: false, action: { type: "click", data: { selector: 'div[data-attrid], div[data-component-type="s-search-result"] h2 a, a' } } };
        return { done: true, action: { type: "finish", data: { reason: "search flow complete" } } };
    }

    // 5) Fallback: finish with reason but include the goal for debugging.
    // Fallback behavior: open a Google search for the full goal. If the user
    // specified a site (e.g. "on amazon" or "on amazon.in"), add a site: hint.
    try {
        const goalText = (params.goal || "").toString().trim();
        // detect explicit site hints like "on amazon" or "on amazon.in"
        const siteMatch = goalText.match(/on\s+([\w.-]+\.(?:com|in|co|net|org|co\.uk|de|ca))/i);
        let siteHint = "";
        if (siteMatch) {
            // normalize simple vendor names to common domains
            const s = siteMatch[1].toLowerCase();
            if (/^amazon(\.|$)/i.test(s) || /amazon/i.test(goalText)) {
                siteHint = " site:amazon.in OR site:amazon.com";
            } else {
                siteHint = ` site:${s}`;
            }
        }

        // If there's a price mention like "under 5000 rupees", keep it verbatim in query
        const query = encodeURIComponent(goalText + (siteHint ? siteHint : ""));
        return {
            done: false,
            action: { type: "open_tab", data: { url: `https://www.google.com/search?q=${query}` } },
        };
    } catch (e) {
        return {
            done: true,
            action: { type: "finish", data: { reason: "deterministic-planner: fallback failed", goal: params.goal } },
        };
    }
}

export async function generateStep(params: {
    model: string;
    goal: string;
    step: number;
    allowlistDomains: string[];
    snapshot: unknown;
    history: unknown[];
}): Promise<unknown> {
    // Try to run a lightweight on-device inference using transformers.js (WASM).
    // This is intended to be zero-cost and run fully on-device in Node via the WASM backend.
    const modelRequested = params.model || "gpt2";

    try {
        const pipe = await ensureGenerationPipeline(modelRequested).catch(async (e) => {
            // If requested model isn't available, fall back to generic 'gpt2'
            if (modelRequested !== "gpt2") {
                return ensureGenerationPipeline("gpt2");
            }
            throw e;
        });

        const system = buildSystem();
        const userPayload = JSON.stringify({
            goal: params.goal,
            step: params.step,
            allowlistDomains: params.allowlistDomains,
            snapshot: params.snapshot,
            history: params.history,
        });

        const prompt = `${system}\n\nUser payload:\n${userPayload}\n\nRespond ONLY with a single JSON object (no explanation).`;

        // Run the pipeline deterministically to reduce hallucinations
        const out = await pipe((prompt as unknown) as string, {
            max_new_tokens: 256,
            do_sample: false,
            temperature: 0.0,
        }) as any;

        // The pipeline may return an array of generations; join texts if needed
        const text = Array.isArray(out) ? out.map((o: any) => o.generated_text || o?.text || "").join("\n") : out?.generated_text || out?.text || String(out || "");

        // Try to parse JSON from the model output
        try {
            return JSON.parse(text);
        } catch (e) {
            // Attempt to extract first JSON object in the text
            const m = text.match(/(\{[\s\S]*\})/);
            if (m && m[1]) {
                try {
                    return JSON.parse(m[1]);
                } catch { }
            }
            // If parsing failed, fall back to the deterministic planner for a useful action
            console.warn("local-model: failed to parse model output, falling back to deterministic planner");
            return deterministicPlanner(params as any);
        }
    } catch (err: any) {
        // If transformers.js isn't available or failed, log full error and use deterministic planner.
        console.error("local-model.generateStep error:", err?.stack || err?.message || err);
        try {
            return deterministicPlanner(params as any);
        } catch (plannerErr) {
            console.error("deterministicPlanner failed:", plannerErr);
            return {
                done: true,
                action: {
                    type: "finish",
                    data: { reason: "local-model-fallback: transformers not available and deterministic planner failed" },
                },
            };
        }
    }
}
