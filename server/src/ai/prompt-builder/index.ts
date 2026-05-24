import type { GenerationParams } from "../types.js";

/**
 * Builds a strict, context-aware prompt for the AI model.
 *
 * The prompt explicitly prioritises:
 *   1. Subject / title
 *   2. Additional instructions (topic focus, e.g. "WW1 and WW2")
 *   3. Question type breakdown
 *   4. Difficulty distribution
 *   5. Strict JSON-only output contract
 */
export function buildPrompt(params: GenerationParams): string {
  const { title, instructions, questionTypes, totalQuestions, totalMarks } = params;

  const questionBreakdown = questionTypes
    .map(
      (qt, i) =>
        `  Section ${String.fromCharCode(65 + i)} — ${qt.count} × "${qt.type}" (${qt.marks} mark${qt.marks !== 1 ? "s" : ""} each)`
    )
    .join("\n");

  const difficultyGuide = questionTypes
    .map((qt) => {
      if (qt.marks === 1) return `  "${qt.type}" → Easy`;
      if (qt.marks <= 3) return `  "${qt.type}" → Moderate`;
      return `  "${qt.type}" → Challenging`;
    })
    .join("\n");

  const instructionBlock = instructions?.trim()
    ? `IMPORTANT — Additional topic focus / special instructions from the teacher:
"${instructions.trim()}"
You MUST incorporate this context directly into the questions. Do NOT ignore it.`
    : `No additional instructions provided. Base all questions strictly on the subject: "${title}".`;

  return `You are an expert educational assessor creating a formal exam paper.

SUBJECT / TITLE: "${title}"

${instructionBlock}

EXAM STRUCTURE:
Total questions: ${totalQuestions}
Total marks: ${totalMarks}

Question type breakdown (create one section per type):
${questionBreakdown}

Difficulty guide:
${difficultyGuide}

RULES:
1. ALL questions must be directly about the subject "${title}" and any additional instructions above.
2. Number questions sequentially from 1 to ${totalQuestions} across all sections.
3. Every question in the answerKey must have a clear, complete answer.
4. Do NOT include any questions about unrelated topics.
5. Return ONLY a valid JSON object — no markdown, no explanation, no preamble.

REQUIRED JSON SCHEMA (return exactly this structure):
{
  "sections": [
    {
      "title": "Section A",
      "instruction": "Answer all questions. Each question carries X marks.",
      "questions": [
        {
          "number": 1,
          "text": "<question text relevant to ${title}>",
          "difficulty": "Easy",
          "marks": 1
        }
      ]
    }
  ],
  "answerKey": [
    {
      "number": 1,
      "text": "<complete answer>"
    }
  ]
}`;
}
