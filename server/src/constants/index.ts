// ============================================================
// Application-wide constants
// ============================================================

export const QUEUE_NAMES = {
  GENERATION: "generationQueue",
  PDF: "pdfQueue",
} as const;

export const JOB_NAMES = {
  GENERATE_AI_QUESTIONS: "generateAIQuestions",
  COMPILE_PDF: "compilePDF",
} as const;

export const CACHE_TTL = {
  ASSIGNMENTS_LIST: 60,       // 60 seconds
  ASSIGNMENT_DETAIL: 60,      // 60 seconds
  GENERATED_PAPER: 300,       // 5 minutes
} as const;

export const CACHE_KEYS = {
  ASSIGNMENTS_ALL: "assignments:all",
  assignment: (id: string) => `assignment:${id}`,
  paper: (id: string) => `paper:${id}`,
} as const;

export const SOCKET_ROOMS = {
  assignment: (id: string) => `assignment:${id}`,
} as const;

export const PROGRESS = {
  JOB_STARTED: 10,
  VALIDATING: 25,
  GENERATING_SECTIONS: 40,
  GENERATING_QUESTIONS: 60,
  GENERATING_ANSWERS: 80,
  FORMATTING_OUTPUT: 90,
  GENERATING_PDF: 95,
  COMPLETED: 100,
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  CREATE_WINDOW_MS: 60 * 1000, // 1 minute
  CREATE_MAX_REQUESTS: 10,
} as const;
