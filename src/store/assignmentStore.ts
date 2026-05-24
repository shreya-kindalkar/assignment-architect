/**
 * Zustand store — single source of truth for assignment state.
 * Uses the typed API service and socket manager; no raw fetch() calls here.
 */
import { create } from "zustand";
import { assignmentApi, paperApi } from "@/services/api";
import { socketManager } from "@/sockets/socketManager";
import type { Assignment } from "@/types/assignment";
import type {
  BackendAssignment,
  GeneratedPaperData,
  ProgressPayload,
  CreateAssignmentInput,
} from "@/types/api";

// ─── State shape ──────────────────────────────────────────────────────────────

export interface AssignmentStoreState {
  // Data
  assignments: Assignment[];
  rawAssignments: BackendAssignment[];
  currentAssignment: BackendAssignment | null;
  currentPaper: GeneratedPaperData | null;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Real-time WebSocket progress
  activeJobId: string | null;
  activeJobProgress: number;
  activeJobStatus: string | null;
  activeJobMessage: string | null;

  // Actions
  fetchAssignments: () => Promise<void>;
  fetchAssignmentById: (id: string) => Promise<BackendAssignment | null>;
  fetchGeneratedPaper: (assignmentId: string) => Promise<GeneratedPaperData | null>;
  createAssignment: (input: CreateAssignmentInput) => Promise<BackendAssignment>;
  deleteAssignment: (id: string) => Promise<void>;
  regeneratePaper: (assignmentId: string) => Promise<void>;
  clearCurrentPaper: () => void;
  startSocketListener: (assignmentId: string, onComplete?: (pdfUrl: string) => void) => void;
  stopSocketListener: () => void;
  resetProgress: () => void;
}

// ─── Helper: map backend → frontend Assignment type ───────────────────────────

function mapToFrontendAssignment(b: BackendAssignment): Assignment {
  const dateObj = new Date(b.createdAt);
  const formattedAssigned = isNaN(dateObj.getTime())
    ? "Today"
    : `${String(dateObj.getDate()).padStart(2, "0")}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${dateObj.getFullYear()}`;

  return {
    id: b._id,
    title: b.title,
    assignedOn: formattedAssigned,
    due: b.dueDate,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAssignmentStore = create<AssignmentStoreState>((set, get) => ({
  assignments: [],
  rawAssignments: [],
  currentAssignment: null,
  currentPaper: null,
  isLoading: false,
  error: null,

  activeJobId: null,
  activeJobProgress: 0,
  activeJobStatus: null,
  activeJobMessage: null,

  // ─── Reset progress state ───────────────────────────────────────────────────
  resetProgress: () => {
    set({
      activeJobId: null,
      activeJobProgress: 0,
      activeJobStatus: null,
      activeJobMessage: null,
    });
  },

  // ─── Fetch all assignments ──────────────────────────────────────────────────
  fetchAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await assignmentApi.list();
      set({
        rawAssignments: data,
        assignments: data.map(mapToFrontendAssignment),
        isLoading: false,
      });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  // ─── Fetch single assignment ────────────────────────────────────────────────
  fetchAssignmentById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await assignmentApi.getById(id);
      set({ currentAssignment: data, isLoading: false });
      return data;
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
      return null;
    }
  },

  // ─── Fetch generated paper ──────────────────────────────────────────────────
  fetchGeneratedPaper: async (assignmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await paperApi.getByAssignmentId(assignmentId);
      set({ currentPaper: data, isLoading: false });
      return data;
    } catch (err: unknown) {
      // 404 is expected while paper is still generating — don't surface as error
      set({ isLoading: false });
      return null;
    }
  },

  // ─── Create assignment ──────────────────────────────────────────────────────
  createAssignment: async (input: CreateAssignmentInput) => {
    set({ isLoading: true, error: null });
    try {
      const { assignment } = await assignmentApi.create(input);
      // Refresh list in background
      get().fetchAssignments().catch(() => null);
      set({ isLoading: false });
      return assignment;
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
      throw err;
    }
  },

  // ─── Delete assignment ──────────────────────────────────────────────────────
  deleteAssignment: async (id: string) => {
    // Optimistic update — remove from UI immediately
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
      rawAssignments: state.rawAssignments.filter((a) => a._id !== id),
    }));
    try {
      await assignmentApi.delete(id);
    } catch (err: unknown) {
      // Rollback on failure by re-fetching
      get().fetchAssignments().catch(() => null);
      set({ error: (err as Error).message });
    }
  },

  // ─── Clear current paper + mark assignment pending (for regenerate) ──────────
  clearCurrentPaper: () => {
    set((state) => ({
      currentPaper: null,
      currentAssignment: state.currentAssignment
        ? { ...state.currentAssignment, status: "pending" }
        : null,
    }));
  },

  // ─── Regenerate paper ───────────────────────────────────────────────────────
  regeneratePaper: async (assignmentId: string) => {
    set({ isLoading: true, error: null });
    try {
      await paperApi.regenerate(assignmentId);
      set({ isLoading: false });
    } catch (err: unknown) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  // ─── Start WebSocket listener ───────────────────────────────────────────────
  startSocketListener: (assignmentId: string, onComplete?: (pdfUrl: string) => void) => {
    get().stopSocketListener();

    set({
      activeJobId: assignmentId,
      activeJobProgress: 0,
      activeJobStatus: "pending",
      activeJobMessage: "Connecting to real-time update room...",
    });

    socketManager.connect(
      assignmentId,
      (payload: ProgressPayload) => {
        set({
          activeJobProgress: payload.progress,
          activeJobStatus: payload.event,
          activeJobMessage: payload.message,
        });

        if (payload.event === "completed") {
          const pdfUrl = payload.data?.pdfUrl ?? "";
          onComplete?.(pdfUrl);
          get().stopSocketListener();
        }

        if (payload.event === "failed") {
          get().stopSocketListener();
        }
      },
      () => {
        // On disconnect — don't clear progress, let UI show last known state
      }
    );
  },

  // ─── Stop WebSocket listener ────────────────────────────────────────────────
  stopSocketListener: () => {
    socketManager.disconnect();
  },
}));
