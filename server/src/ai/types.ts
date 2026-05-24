// ─── Shared AI pipeline types ─────────────────────────────────────────────────

export interface QuestionTypeInput {
  type: string;
  count: number;
  marks: number;
}

export interface GenerationParams {
  title: string;
  instructions?: string;
  questionTypes: QuestionTypeInput[];
  totalQuestions: number;
  totalMarks: number;
}

export interface QuestionItem {
  number: number;
  text: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  marks: number;
}

export interface QuestionSection {
  title: string;
  instruction?: string;
  questions: QuestionItem[];
}

export interface AnswerKeyItem {
  number: number;
  text: string;
}

export interface GeneratedPaperOutput {
  sections: QuestionSection[];
  answerKey: AnswerKeyItem[];
}

export type GenerationSource = "gemini-flash" | "gemini-pro" | "fallback";

export interface GenerationResult {
  paper: GeneratedPaperOutput;
  source: GenerationSource;
  timeSpentMs: number;
}
