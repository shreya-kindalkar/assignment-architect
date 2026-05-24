import { Worker, Job } from "bullmq";
import { isRedisAvailable, redisClient } from "../config/redis.js";
import { QueueManager, MockQueue } from "../queues/queue.manager.js";
import { Assignment } from "../models/assignment.model.js";
import { GeneratedPaper } from "../models/generated-paper.model.js";
import { generatePaper } from "../ai/services/generation.service.js";
import { PDFService } from "../services/pdf.service.js";
import { emitProgress } from "../sockets/socket.manager.js";
import { mockDatabase, isDbConnected } from "../config/db.js";
import { Types } from "mongoose";
import { sleep } from "../utils/index.js";
import { PROGRESS } from "../constants/index.js";
import type { AssignmentStatus } from "../types/index.js";

// ─── DB Helpers ──────────────────────────────────────────────────────────────

async function findAssignmentById(id: string) {
  if (isDbConnected()) {
    return await Assignment.findById(id);
  }
  return mockDatabase.assignments.get(id) ?? null;
}

async function updateAssignmentStatus(id: string, status: AssignmentStatus): Promise<void> {
  console.log(`[Worker DB] Updating Assignment ${id} status → ${status}`);
  if (isDbConnected()) {
    await Assignment.findByIdAndUpdate(id, { status, updatedAt: new Date() });
  } else {
    const record = mockDatabase.assignments.get(id);
    if (record) {
      record.status = status;
      record.updatedAt = new Date();
      mockDatabase.assignments.set(id, record);
    }
  }
}

async function saveGeneratedPaper(paperData: Record<string, unknown>): Promise<unknown> {
  if (isDbConnected()) {
    // Delete existing paper if regenerating
    await GeneratedPaper.findOneAndDelete({ assignmentId: paperData.assignmentId });
    const paper = new GeneratedPaper(paperData);
    return await paper.save();
  } else {
    const key = String(paperData.assignmentId);
    mockDatabase.generatedPapers.set(key, paperData);
    return paperData;
  }
}

async function findGeneratedPaperByAssignmentId(id: string) {
  if (isDbConnected()) {
    return await GeneratedPaper.findOne({ assignmentId: new Types.ObjectId(id) });
  }
  return mockDatabase.generatedPapers.get(id) ?? null;
}

async function updatePaperPdfUrl(assignmentId: string, pdfUrl: string): Promise<void> {
  if (isDbConnected()) {
    await GeneratedPaper.findOneAndUpdate(
      { assignmentId: new Types.ObjectId(assignmentId) },
      { pdfUrl, updatedAt: new Date() }
    );
  } else {
    const paper = mockDatabase.generatedPapers.get(assignmentId);
    if (paper) {
      paper.pdfUrl = pdfUrl;
      paper.updatedAt = new Date();
      mockDatabase.generatedPapers.set(assignmentId, paper);
    }
  }
}

// ─── Job Processors ──────────────────────────────────────────────────────────

/**
 * Processes the AI question generation job.
 * Fetches assignment → calls AI service → saves paper → enqueues PDF job.
 */
export async function processGenerationJob(job: { data: { assignmentId: string } }): Promise<void> {
  const { assignmentId } = job.data;
  console.log(`[Generation Worker] Starting generation for assignment: ${assignmentId}`);

  try {
    const assignment = await findAssignmentById(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found.`);
    }

    await updateAssignmentStatus(assignmentId, "processing");

    emitProgress(assignmentId, "job_started", "Job initialized in background worker.", PROGRESS.JOB_STARTED);
    await sleep(1200);

    emitProgress(assignmentId, "validating", "Validating assignment structure and guidelines.", PROGRESS.VALIDATING);
    await sleep(1200);

    emitProgress(assignmentId, "generating_sections", "Structuring exam format and section headers.", PROGRESS.GENERATING_SECTIONS);
    await sleep(1200);

    emitProgress(assignmentId, "generating_questions", "Drafting educational questions tailored to topic weightages.", PROGRESS.GENERATING_QUESTIONS);

    const result = await generatePaper({
      title: assignment.title,
      instructions: assignment.instructions,
      questionTypes: assignment.questionTypes,
      totalQuestions: assignment.totalQuestions,
      totalMarks: assignment.totalMarks,
    });

    console.log(`[Generation Worker] Paper generated via "${result.source}" in ${result.timeSpentMs}ms`);
    const paperResult = result.paper;
    const timeSpentMs = result.timeSpentMs;
    const modelName = result.source === "gemini-flash"
      ? "Gemini-2.5-Flash"
      : result.source === "gemini-pro"
        ? "Gemini-2.0-Flash"
        : "Topic-Aware-Fallback";

    emitProgress(assignmentId, "generating_answers", "Drafting complete official evaluation answer keys.", PROGRESS.GENERATING_ANSWERS);
    await sleep(1200);

    emitProgress(assignmentId, "formatting_output", "Finalizing schema validation and JSON alignment.", PROGRESS.FORMATTING_OUTPUT);
    await sleep(1000);

    const paperRecord = {
      assignmentId: isDbConnected() ? new Types.ObjectId(assignmentId) : assignmentId,
      sections: paperResult.sections,
      difficulty: "CBSE Standard",
      marks: assignment.totalMarks,
      answerKey: paperResult.answerKey,
      generationMetadata: {
        timeSpentMs,
        modelName,
      },
    };

    await saveGeneratedPaper(paperRecord as Record<string, unknown>);
    console.log(`[Generation Worker] Saved generated paper for assignment: ${assignmentId}`);

    // Enqueue PDF compilation job
    await QueueManager.addJob("pdfQueue", "compilePDF", { assignmentId });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Generation Worker Failed] ${message}`);
    await updateAssignmentStatus(assignmentId, "failed");
    emitProgress(assignmentId, "failed", `AI generation failed: ${message}`, 0);
  }
}

/**
 * Processes the PDF compilation job.
 * Fetches paper → generates PDF via PDFKit → updates pdfUrl → emits completed.
 */
export async function processPdfJob(job: { data: { assignmentId: string } }): Promise<void> {
  const { assignmentId } = job.data;
  console.log(`[PDF Worker] Starting PDF compilation for assignment: ${assignmentId}`);

  try {
    emitProgress(assignmentId, "generating_pdf", "Formatting typography and generating printable PDF.", PROGRESS.GENERATING_PDF);
    await sleep(1500);

    const assignment = await findAssignmentById(assignmentId);
    const paper = await findGeneratedPaperByAssignmentId(assignmentId);

    if (!assignment || !paper) {
      throw new Error("Missing assignment or generated paper data required to compile PDF.");
    }

    const pdfResult = await PDFService.generateExamPaperPDF(assignmentId, {
      title: assignment.title,
      dueDate: assignment.dueDate,
      totalMarks: assignment.totalMarks,
      totalQuestions: assignment.totalQuestions,
      instructions: assignment.instructions,
      sections: paper.sections,
      answerKey: paper.answerKey,
    });

    await updatePaperPdfUrl(assignmentId, pdfResult.relativeUrl);
    await updateAssignmentStatus(assignmentId, "completed");

    emitProgress(assignmentId, "completed", "Question paper and answer key generated successfully!", PROGRESS.COMPLETED, {
      pdfUrl: pdfResult.relativeUrl,
      assignmentId,
    });

    console.log(`[PDF Worker] PDF generation complete for: ${assignmentId}`);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[PDF Worker Failed] ${message}`);
    await updateAssignmentStatus(assignmentId, "failed");
    emitProgress(assignmentId, "failed", `PDF compilation failed: ${message}`, 0);
  }
}

// ─── Worker Bootstrap ─────────────────────────────────────────────────────────

export function initBackgroundWorkers(): void {
  const genQueue = QueueManager.getQueue("generationQueue");
  const pdfQueue = QueueManager.getQueue("pdfQueue");

  if (isRedisAvailable && redisClient) {
    console.log("[Worker Manager] Initializing production BullMQ Workers with Redis.");

    const generationWorker = new Worker(
      "generationQueue",
      async (job: Job) => {
        await processGenerationJob(job as { data: { assignmentId: string } });
      },
      {
        connection: redisClient,
        concurrency: 2,
      }
    );

    const pdfWorker = new Worker(
      "pdfQueue",
      async (job: Job) => {
        await processPdfJob(job as { data: { assignmentId: string } });
      },
      {
        connection: redisClient,
        concurrency: 2,
      }
    );

    generationWorker.on("failed", (job, err) => {
      console.error(`[BullMQ] Generation job ${job?.id} failed:`, err.message);
    });

    pdfWorker.on("failed", (job, err) => {
      console.error(`[BullMQ] PDF job ${job?.id} failed:`, err.message);
    });

    generationWorker.on("completed", (job) => {
      console.log(`[BullMQ] Generation job ${job.id} completed.`);
    });

    pdfWorker.on("completed", (job) => {
      console.log(`[BullMQ] PDF job ${job.id} completed.`);
    });

  } else {
    console.log("[Worker Manager] Redis unavailable — using in-process MockQueue workers.");

    if (genQueue instanceof MockQueue) {
      genQueue.on("process_job", async (job: { data: { assignmentId: string } }) => {
        await processGenerationJob(job);
      });
    }

    if (pdfQueue instanceof MockQueue) {
      pdfQueue.on("process_job", async (job: { data: { assignmentId: string } }) => {
        await processPdfJob(job);
      });
    }
  }
}
