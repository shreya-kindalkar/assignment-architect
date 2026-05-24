// ─── API & Socket ────────────────────────────────────────────────────────────
// In production these are set via VITE_API_URL and VITE_SOCKET_URL env vars
export const API_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "http://localhost:5000/api";

export const SOCKET_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SOCKET_URL) ||
  "http://localhost:5000";

// ─── WebSocket Events ─────────────────────────────────────────────────────────
export const WS_EVENTS = {
  JOB_STARTED: "job_started",
  VALIDATING: "validating",
  GENERATING_SECTIONS: "generating_sections",
  GENERATING_QUESTIONS: "generating_questions",
  GENERATING_ANSWERS: "generating_answers",
  FORMATTING_OUTPUT: "formatting_output",
  GENERATING_PDF: "generating_pdf",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

// ─── Progress Steps (matches backend emit sequence) ───────────────────────────
export const PROGRESS_STEPS = [
  { key: WS_EVENTS.JOB_STARTED,          label: "Initialize Queue & Async Job" },
  { key: WS_EVENTS.VALIDATING,           label: "Validate Guidelines & Rubric" },
  { key: WS_EVENTS.GENERATING_SECTIONS,  label: "Structure Paper Sections" },
  { key: WS_EVENTS.GENERATING_QUESTIONS, label: "Draft Tailored Exam Questions" },
  { key: WS_EVENTS.GENERATING_ANSWERS,   label: "Author Complete Answer Key" },
  { key: WS_EVENTS.FORMATTING_OUTPUT,    label: "Align JSON Schema Constraints" },
  { key: WS_EVENTS.GENERATING_PDF,       label: "Compile Professional Typography PDF" },
] as const;

// ─── Assignment Status ────────────────────────────────────────────────────────
export const ASSIGNMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

// ─── Question Difficulty ──────────────────────────────────────────────────────
export const DIFFICULTY = {
  EASY: "Easy",
  MODERATE: "Moderate",
  CHALLENGING: "Challenging",
} as const;

// ─── Default Question Types ───────────────────────────────────────────────────
export const DEFAULT_QUESTION_TYPES = [
  { id: "1", type: "Multiple Choice Questions", count: 4, marks: 1 },
  { id: "2", type: "Short Questions",           count: 3, marks: 2 },
  { id: "3", type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
  { id: "4", type: "Numerical Problems",        count: 5, marks: 5 },
] as const;
