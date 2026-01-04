import type { Pipeline } from "@xenova/transformers";

// Singleton to prevent reloading the model on every step
let generationPipeline: Pipeline | null = null;

/**
 * Builds the system prompt for the on-device LLM.
 */
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

/**
 * Loads the Transformers.js pipeline (WASM).
 */
async function ensureGenerationPipeline(modelName = "gpt2") {
    if (generationPipeline) return generationPipeline;

    try {
        const { pipeline } = await import("@xenova/transformers");
        generationPipeline = (await pipeline("text-generation", modelName, {})) as unknown as Pipeline;
        return generationPipeline;
    } catch (err) {
        generationPipeline = null;
        throw err;
    }
}

/**
 * Constructs a Google search URL with optional site filters.
 */
function makeGoogleSearch(q: string, siteHint?: string) {
    const full = q + (siteHint ? ` ${siteHint}` : "");
    return `https://www.google.com/search?q=${encodeURIComponent(full)}`;
}

/**
 * A rule-based planner used as a fallback or for initial navigation steps.
 */
function deterministicPlanner(params: {
    goal: string;
    step: number;
}) {
    const goalText = (params.goal || "").toString().trim();
    const stepNum = Number(params.step || 0);

    // Detect explicit site hints (e.g., "Find shoes on amazon.com")
    const siteMatch = goalText.match(/on\s+([\w.-]+\.(?:com|in|co|net|org|co\.uk|de|ca))/i);
    let siteHint = "";
    if (siteMatch) {
        const s = siteMatch[1].toLowerCase();
        if (/^amazon(\.|$)/i.test(s) || /amazon/i.test(goalText)) {
            siteHint = " site:amazon.in OR site:amazon.com";
        } else {
            siteHint = ` site:${s}`;
        }
    }

    // Step 0: Open Google Search
    if (stepNum === 0) {
        return { done: false, action: { type: "open_tab", data: { url: makeGoogleSearch(goalText, siteHint) } } };
    }

    // Step 1: Click the first result
    if (stepNum === 1) {
        return { done: false, action: { type: "click", data: { selector: "div#search a" } } };
    }

    // Heuristics for common browser tasks
    const lower = goalText.toLowerCase();
    if (/(buy|add to cart|purchase|checkout|order|add to basket)/i.test(lower)) {
        return { done: false, action: { type: "click", data: { text: "add to cart" } } };
    }
    if (/contact|support|customer service|reach out|email us|phone|call us/i.test(lower)) {
        return { done: false, action: { type: "click", data: { text: "contact" } } };
    }
    if (/(price|under|below|cost|rupees|inr|rs)/i.test(lower)) {
        return { done: false, action: { type: "extract", data: { mode: "page_snapshot" } } };
    }

    // Default action
    return { done: false, action: { type: "click", data: { text: "view" } } };
}

/**
 * Generates the next automation step using local LLM or deterministic fallback.
 */
export async function generateStep(params: {
    model: string;
    goal: string;
    step: number;
    allowlistDomains: string[];
    snapshot: unknown;
    history: unknown[];
}): Promise<unknown> {
    const modelRequested = params.model || "gpt2";

    try {
        const pipe = await ensureGenerationPipeline(modelRequested).catch(async (e) => {
            // Fallback to gpt2 if specific model fails to load
            if (modelRequested !== "gpt2") return ensureGenerationPipeline("gpt2");
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

        const prompt = `${system}\n\nUser payload:\n${userPayload}\n\nRespond ONLY with a single JSON object.`;

        // Run inference
        const out = await pipe(prompt, {
            max_new_tokens: 256,
            do_sample: false,
            temperature: 0.0,
        }) as any;

        // Parse text from various possible output formats
        const text = Array.isArray(out)
            ? out.map((o: any) => o.generated_text || o?.text || "").join("\n")
            : out?.generated_text || out?.text || String(out || "");

        try {
            return JSON.parse(text);
        } catch (e) {
            // RegEx attempt to find a JSON block if the model added extra prose
            const m = text.match(/(\{[\s\S]*\})/);
            if (m && m[1]) {
                try {
                    return JSON.parse(m[1]);
                } catch { }
            }
            console.warn("local-model: Model output was not valid JSON, using deterministic fallback.");
            return deterministicPlanner(params);
        }
    } catch (err: any) {
        console.error("local-model error:", err?.message || err);
        try {
            return deterministicPlanner(params);
        } catch (fallbackErr) {
            return {
                done: true,
                action: { type: "finish", data: { reason: "Automation failed: both LLM and fallback logic errored." } },
            };
        }
    }
}