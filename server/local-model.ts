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
    const goal = (params.goal || "").toString().toLowerCase();

    // Simple heuristics for common browser automation goals.
    // 1) Search queries: "search for X" or "find X"
    const searchMatch = goal.match(/(?:search for|find)\s+(.{3,})/i);
    if (searchMatch) {
        const q = encodeURIComponent(searchMatch[1].trim());
        return {
            done: false,
            action: {
                type: "open_tab",
                data: { url: `https://www.google.com/search?q=${q}` },
            },
        };
    }

    // 2) Open URL: "open example.com" or "open the homepage"
    const openMatch = goal.match(/open\s+(https?:\/\/)?([\w.-]+)(\/.+)?/i);
    if (openMatch) {
        const host = openMatch[2];
        const path = openMatch[3] || "";
        const url = openMatch[1] ? `https://${host}${path}` : `https://${host}${path}`;
        return { done: false, action: { type: "open_tab", data: { url } } };
    }

    // 3) Fallback: finish with reason but include the goal for debugging.
    return {
        done: true,
        action: { type: "finish", data: { reason: "deterministic-planner: no matching heuristic", goal: params.goal } },
    };
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
