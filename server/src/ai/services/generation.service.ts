import { buildPrompt } from "../prompt-builder/index.js";
import { callGemini } from "../providers/gemini.js";
import { parseAndValidate } from "../parsers/json-parser.js";
import { generateFallbackPaper } from "../fallback/mock-generator.js";
import { config } from "../../config/env.js";
import type { GenerationParams, GenerationResult } from "../types.js";

const MAX_RETRIES = 2;

/**
 * Main AI generation service.
 *
 * Priority chain:
 *   1. Gemini 1.5 Flash  (up to MAX_RETRIES attempts)
 *   2. Gemini 1.5 Pro    (one attempt if Flash exhausted)
 *   3. Topic-aware fallback (only if ALL API calls fail)
 */
export async function generatePaper(params: GenerationParams): Promise<GenerationResult> {
  const start = Date.now();
  const prompt = buildPrompt(params);

  if (config.geminiApiKey) {
    // ── Attempt 1: Gemini 2.5 Flash ──────────────────────────────────────────
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[AI] Gemini 2.5 Flash — attempt ${attempt}/${MAX_RETRIES} for "${params.title}"`);
        const raw = await callGemini(prompt, "gemini-2.5-flash");
        const paper = parseAndValidate(raw);
        if (paper) {
          console.log(`[AI] Gemini 2.5 Flash succeeded on attempt ${attempt}.`);
          return { paper, source: "gemini-flash", timeSpentMs: Date.now() - start };
        }
        console.warn(`[AI] Gemini 2.5 Flash attempt ${attempt} returned invalid JSON — retrying.`);
      } catch (err) {
        console.warn(`[AI] Gemini 2.5 Flash attempt ${attempt} failed:`, (err as Error).message);
      }
    }

    // ── Attempt 2: Gemini 2.0 Flash fallback ─────────────────────────────────
    try {
      console.log(`[AI] Falling back to Gemini 2.0 Flash for "${params.title}"`);
      const raw = await callGemini(prompt, "gemini-2.0-flash");
      const paper = parseAndValidate(raw);
      if (paper) {
        console.log(`[AI] Gemini 2.0 Flash succeeded.`);
        return { paper, source: "gemini-pro", timeSpentMs: Date.now() - start };
      }
      console.warn(`[AI] Gemini 2.0 Flash returned invalid JSON.`);
    } catch (err) {
      console.warn(`[AI] Gemini 2.0 Flash failed:`, (err as Error).message);
    }
  } else {
    console.log(`[AI] No GEMINI_API_KEY — using topic-aware fallback for "${params.title}"`);
  }

  // ── Final fallback: topic-aware mock (never hardcoded science) ────────────
  console.log(`[AI] Using topic-aware fallback generator for "${params.title}"`);
  const paper = generateFallbackPaper(params);
  return { paper, source: "fallback", timeSpentMs: Date.now() - start };
}
