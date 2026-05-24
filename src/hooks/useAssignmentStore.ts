/**
 * Re-export from the canonical store location.
 * Existing imports of `@/hooks/useAssignmentStore` continue to work unchanged.
 */
export { useAssignmentStore } from "@/store/assignmentStore";
export type {
  AssignmentStoreState,
} from "@/store/assignmentStore";

// Re-export API types for convenience (used by route components)
export type { BackendAssignment, GeneratedPaperData } from "@/types/api";
