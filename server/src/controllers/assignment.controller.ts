import { Request, Response, NextFunction } from "express";
import { CreateAssignmentZodSchema } from "../validators/assignment.validator.js";
import { Assignment } from "../models/assignment.model.js";
import { GeneratedPaper } from "../models/generated-paper.model.js";
import { QueueManager } from "../queues/queue.manager.js";
import { cacheService } from "../config/redis.js";
import { isDbConnected, mockDatabase } from "../config/db.js";
import { Types } from "mongoose";
import { CACHE_KEYS, CACHE_TTL } from "../constants/index.js";
import type { AssignmentStatus } from "../types/index.js";

// ─── DB Helpers ──────────────────────────────────────────────────────────────

async function fetchAllAssignmentsFromDB() {
  if (isDbConnected()) {
    return await Assignment.find().sort({ createdAt: -1 });
  }
  return Array.from(mockDatabase.assignments.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function fetchAssignmentByIdFromDB(id: string) {
  if (isDbConnected()) {
    return await Assignment.findById(id);
  }
  return mockDatabase.assignments.get(id) ?? null;
}

async function fetchPaperByAssignmentIdFromDB(id: string) {
  if (isDbConnected()) {
    return await GeneratedPaper.findOne({ assignmentId: new Types.ObjectId(id) });
  }
  return mockDatabase.generatedPapers.get(id) ?? null;
}

async function updateAssignmentStatus(id: string, status: AssignmentStatus): Promise<void> {
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

// ─── Cache Invalidation ───────────────────────────────────────────────────────

async function invalidateListCache(): Promise<void> {
  await cacheService.del(CACHE_KEYS.ASSIGNMENTS_ALL);
}

async function invalidatePaperCache(assignmentId: string): Promise<void> {
  await Promise.all([
    cacheService.del(CACHE_KEYS.paper(assignmentId)),
    cacheService.del(CACHE_KEYS.assignment(assignmentId)),
    invalidateListCache(),
  ]);
}

// ─── Controller ───────────────────────────────────────────────────────────────

export const AssignmentController = {

  /**
   * GET /api/health
   */
  async getHealth(_req: Request, res: Response): Promise<void> {
    res.json({
      status: "UP",
      timestamp: new Date().toISOString(),
      services: {
        database: isDbConnected() ? "CONNECTED" : "FALLBACK_MEMORY",
        redis: cacheService.isAvailable() ? "CONNECTED" : "FALLBACK_MEMORY",
        queues: "ACTIVE",
      },
    });
  },

  /**
   * POST /api/assignments/create
   */
  async createAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parseResult = CreateAssignmentZodSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: parseResult.error.format(),
        });
        return;
      }

      const input = parseResult.data;
      const totalQuestions = input.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
      const totalMarks = input.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

      let createdRecord: Record<string, unknown>;

      if (isDbConnected()) {
        const assignment = new Assignment({
          ...input,
          totalQuestions,
          totalMarks,
          status: "pending",
        });
        const saved = await assignment.save();
        createdRecord = saved.toObject() as unknown as Record<string, unknown>;
      } else {
        const mockId = new Types.ObjectId().toString();
        createdRecord = {
          _id: mockId,
          id: mockId,
          ...input,
          totalQuestions,
          totalMarks,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockDatabase.assignments.set(mockId, createdRecord);
      }

      const recordId = String(createdRecord._id);

      await invalidateListCache();

      console.log(`[Controller] Dispatching generation job for Assignment ${recordId}`);
      await QueueManager.addJob("generationQueue", "generateAIQuestions", { assignmentId: recordId });

      res.status(201).json({
        success: true,
        message: "Assignment created successfully. Queued for AI generation.",
        assignment: createdRecord,
      });

    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/assignments
   */
  async getAssignments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cacheKey = CACHE_KEYS.ASSIGNMENTS_ALL;
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        console.log("[Controller] Cache-Hit: assignments list");
        res.json(JSON.parse(cached));
        return;
      }

      console.log("[Controller] Cache-Miss: fetching assignments from DB");
      const assignments = await fetchAllAssignmentsFromDB();
      await cacheService.set(cacheKey, JSON.stringify(assignments), CACHE_TTL.ASSIGNMENTS_LIST);

      res.json(assignments);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/assignments/:id
   */
  async getAssignmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params["id"] as string;
      const cacheKey = CACHE_KEYS.assignment(id);
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        console.log(`[Controller] Cache-Hit: assignment ${id}`);
        res.json(JSON.parse(cached));
        return;
      }

      const assignment = await fetchAssignmentByIdFromDB(id);
      if (!assignment) {
        res.status(404).json({ success: false, error: "Assignment not found." });
        return;
      }

      await cacheService.set(cacheKey, JSON.stringify(assignment), CACHE_TTL.ASSIGNMENT_DETAIL);
      res.json(assignment);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/generated-paper/:id
   */
  async getGeneratedPaperByAssignmentId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params["id"] as string;
      const cacheKey = CACHE_KEYS.paper(id);
      const cached = await cacheService.get(cacheKey);

      if (cached) {
        console.log(`[Controller] Cache-Hit: generated paper ${id}`);
        res.json(JSON.parse(cached));
        return;
      }

      const paper = await fetchPaperByAssignmentIdFromDB(id);
      if (!paper) {
        res.status(404).json({ success: false, error: "Generated paper not found for this assignment." });
        return;
      }

      await cacheService.set(cacheKey, JSON.stringify(paper), CACHE_TTL.GENERATED_PAPER);
      res.json(paper);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/assignments/:id
   */
  async deleteAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params["id"] as string;

      const assignment = await fetchAssignmentByIdFromDB(id);
      if (!assignment) {
        res.status(404).json({ success: false, error: "Assignment not found." });
        return;
      }

      if (isDbConnected()) {
        await Assignment.findByIdAndDelete(id);
        await GeneratedPaper.findOneAndDelete({ assignmentId: new Types.ObjectId(id) });
      } else {
        mockDatabase.assignments.delete(id);
        mockDatabase.generatedPapers.delete(id);
      }

      // Purge all related cache entries
      await invalidatePaperCache(id);

      console.log(`[Controller] Deleted assignment ${id} and associated paper.`);
      res.json({ success: true, message: "Assignment deleted successfully.", id });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/generated-paper/:id/regenerate
   */
  async regeneratePaper(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params["id"] as string;
      const assignment = await fetchAssignmentByIdFromDB(id);

      if (!assignment) {
        res.status(404).json({ success: false, error: "Assignment not found for regeneration." });
        return;
      }

      // Reset status and invalidate caches
      await updateAssignmentStatus(id, "pending");
      await invalidatePaperCache(id);

      console.log(`[Controller] Re-dispatching generation job for Assignment ${id}`);
      await QueueManager.addJob("generationQueue", "generateAIQuestions", { assignmentId: id });

      res.json({
        success: true,
        message: "Regeneration job enqueued successfully.",
        assignmentId: id,
      });

    } catch (err) {
      next(err);
    }
  },
};
