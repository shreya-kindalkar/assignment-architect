// ============================================================
// Shared TypeScript types for the VedaAI backend
// ============================================================

export type AssignmentStatus = "pending" | "processing" | "completed" | "failed";

export type QuestionDifficulty = "Easy" | "Moderate" | "Challenging";

export type WebSocketEvent =
  | "job_started"
  | "validating"
  | "generating_sections"
  | "generating_questions"
  | "generating_answers"
  | "formatting_output"
  | "generating_pdf"
  | "completed"
  | "failed";

export interface QuestionTypeInput {
  id?: string;
  type: string;
  count: number;
  marks: number;
}

export interface CreateAssignmentPayload {
  title: string;
  dueDate: string;
  instructions?: string;
  uploadedFiles?: string[];
  questionTypes: QuestionTypeInput[];
}

export interface QuestionItem {
  number: number;
  text: string;
  difficulty: QuestionDifficulty;
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

export interface ProgressPayload {
  assignmentId: string;
  event: WebSocketEvent;
  message: string;
  progress: number;
  data?: Record<string, unknown>;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface JobData {
  assignmentId: string;
}

export interface GenerationMetadata {
  timeSpentMs?: number;
  modelName?: string;
  promptTokens?: number;
  completionTokens?: number;
}
