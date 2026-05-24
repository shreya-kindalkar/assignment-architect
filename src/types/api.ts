/**
 * Shared API types — mirrors the backend models exactly.
 * Keep in sync with server/src/types/index.ts.
 */
import type { QuestionPaperSection } from "./assignment";

// ─── Assignment ───────────────────────────────────────────────────────────────

export type AssignmentStatus = "pending" | "processing" | "completed" | "failed";

export interface BackendQuestionType {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export interface BackendAssignment {
  _id: string;
  title: string;
  dueDate: string;
  uploadedFiles: string[];
  questionTypes: BackendQuestionType[];
  instructions?: string;
  totalQuestions: number;
  totalMarks: number;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Generated Paper ──────────────────────────────────────────────────────────

export interface GeneratedPaperData {
  _id: string;
  assignmentId: string;
  sections: QuestionPaperSection[];
  answerKey: Array<{ number: number; text: string }>;
  difficulty: string;
  marks: number;
  pdfUrl?: string;
  generationMetadata?: {
    timeSpentMs?: number;
    modelName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── API Request Payloads ─────────────────────────────────────────────────────

export interface CreateAssignmentInput {
  title: string;
  dueDate: string;
  instructions?: string;
  uploadedFiles?: string[];
  questionTypes: Array<{ type: string; count: number; marks: number }>;
}

// ─── WebSocket Progress ───────────────────────────────────────────────────────

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

export interface ProgressPayload {
  assignmentId: string;
  event: WebSocketEvent;
  message: string;
  progress: number;
  data?: {
    pdfUrl?: string;
    assignmentId?: string;
  };
}
