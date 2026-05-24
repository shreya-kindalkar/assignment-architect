import { GeneratedPaperSchema, type ValidatedPaper } from "../validators/schema.js";

/**
 * Cleans raw LLM text output and attempts to extract valid JSON.
 * Handles markdown code fences, leading/trailing garbage, and partial wrapping.
 */
function extractJson(raw: string): string {
  let text = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }

  // Find the first { and last } to extract the JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return text;
}

/**
 * Parses and validates raw LLM output against the GeneratedPaper schema.
 * Returns null if parsing or validation fails.
 */
export function parseAndValidate(rawText: string): ValidatedPaper | null {
  const cleaned = extractJson(rawText);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.warn("[Parser] JSON.parse failed on cleaned text.");
    return null;
  }

  const result = GeneratedPaperSchema.safeParse(parsed);
  if (result.success) {
    return result.data;
  }

  console.warn("[Parser] Zod validation failed:", result.error.flatten().fieldErrors);
  return null;
}
