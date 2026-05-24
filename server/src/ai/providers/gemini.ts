import { config } from "../../config/env.js";

// Use model IDs exactly as returned by the API
export type GeminiModel = "gemini-2.5-flash" | "gemini-2.0-flash";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: { message: string; code: number };
}

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 45_000;

/**
 * Calls the Gemini REST API with a given model and prompt.
 * Returns the raw text response or throws on failure.
 */
export async function callGemini(
  prompt: string,
  model: GeminiModel = "gemini-2.5-flash"
): Promise<string> {
  if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const url = `${GEMINI_BASE}/${model}:generateContent?key=${config.geminiApiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topP: 0.9,
          maxOutputTokens: 8192,
        },
      }),
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "unknown error");
    throw new Error(`Gemini ${model} HTTP ${response.status}: ${errText}`);
  }

  const data = (await response.json()) as GeminiResponse;

  if (data.error) {
    throw new Error(`Gemini API error: ${data.error.message}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Gemini ${model} returned empty content.`);
  }

  return text;
}
