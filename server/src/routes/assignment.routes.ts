import { Router } from "express";
import { AssignmentController } from "../controllers/assignment.controller.js";
import { createRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

// ─── Health ───────────────────────────────────────────────────────────────────
router.get("/health", AssignmentController.getHealth);

// ─── Assignments ──────────────────────────────────────────────────────────────
router.post("/assignments/create", createRateLimiter, AssignmentController.createAssignment);
router.get("/assignments", AssignmentController.getAssignments);
router.get("/assignments/:id", AssignmentController.getAssignmentById);
router.delete("/assignments/:id", AssignmentController.deleteAssignment);

// ─── Generated Papers ─────────────────────────────────────────────────────────
router.get("/generated-paper/:id", AssignmentController.getGeneratedPaperByAssignmentId);
router.post("/generated-paper/:id/regenerate", createRateLimiter, AssignmentController.regeneratePaper);

export default router;
