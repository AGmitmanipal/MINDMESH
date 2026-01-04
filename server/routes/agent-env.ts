import type { RequestHandler } from "express";

export const handleAgentEnv: RequestHandler = async (_req, res) => {
  const key = process.env.GEMINI_API_KEY || "AIzaSyA3wgB3UihrVLXyKbl451FMitgwkUANZRA";
  const model = process.env.MODEL_USED || "gemini-2.5-flash";
  res.json({
    ok: true,
    cwd: process.cwd(),
    GEMINI_API_KEY_present: Boolean(key),
    GEMINI_API_KEY_len: key ? key.length : 0,
    MODEL_USED: model,
    hint:
      "If GEMINI_API_KEY_present=false, ensure .env is in the repo root (same folder as package.json) and restart pnpm dev. If you are deployed (Netlify), set env vars there.",
  });
};


