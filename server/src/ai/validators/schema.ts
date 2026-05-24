import { z } from "zod";

// ─── Zod schemas for AI output validation ────────────────────────────────────

export const QuestionItemSchema = z.object({
  number: z.number().int().positive(),
  text: z.string().min(1, "Question text cannot be empty"),
  difficulty: z.enum(["Easy", "Moderate", "Challenging"]),
  marks: z.number().nonnegative(),
});

export const QuestionSectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().optional(),
  questions: z.array(QuestionItemSchema).min(1),
});

export const AnswerKeyItemSchema = z.object({
  number: z.number().int().positive(),
  text: z.string().min(1),
});

export const GeneratedPaperSchema = z.object({
  sections: z.array(QuestionSectionSchema).min(1),
  answerKey: z.array(AnswerKeyItemSchema).min(1),
});

export type ValidatedPaper = z.infer<typeof GeneratedPaperSchema>;
