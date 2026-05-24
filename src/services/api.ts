/**
 * Typed API service layer.
 * All HTTP calls to the backend go through here — never call fetch() directly in components.
 */
import { API_BASE_URL } from "@/constants";
import type {
  BackendAssignment,
  GeneratedPaperData,
  CreateAssignmentInput,
} from "@/types/api";

// ─── Generic request helper ───────────────────────────────────────────────────

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string; message?: string };
    throw new Error(body.error ?? body.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Assignment endpoints ─────────────────────────────────────────────────────

export const assignmentApi = {
  /** GET /api/assignments */
  list(): Promise<BackendAssignment[]> {
    return request<BackendAssignment[]>("/assignments");
  },

  /** GET /api/assignments/:id */
  getById(id: string): Promise<BackendAssignment> {
    return request<BackendAssignment>(`/assignments/${id}`);
  },

  /** POST /api/assignments/create */
  create(input: CreateAssignmentInput): Promise<{ assignment: BackendAssignment; message: string }> {
    return request<{ assignment: BackendAssignment; message: string }>("/assignments/create", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /** DELETE /api/assignments/:id */
  delete(id: string): Promise<{ success: boolean; message: string; id: string }> {
    return request<{ success: boolean; message: string; id: string }>(`/assignments/${id}`, {
      method: "DELETE",
    });
  },
};

// ─── Generated paper endpoints ────────────────────────────────────────────────

export const paperApi = {
  /** GET /api/generated-paper/:id */
  getByAssignmentId(assignmentId: string): Promise<GeneratedPaperData> {
    return request<GeneratedPaperData>(`/generated-paper/${assignmentId}`);
  },

  /** POST /api/generated-paper/:id/regenerate */
  regenerate(assignmentId: string): Promise<{ message: string; assignmentId: string }> {
    return request<{ message: string; assignmentId: string }>(
      `/generated-paper/${assignmentId}/regenerate`,
      { method: "POST" }
    );
  },
};

// ─── Health check ─────────────────────────────────────────────────────────────

export const healthApi = {
  check(): Promise<{ status: string; timestamp: string; services: Record<string, string> }> {
    return request("/health");
  },
};
