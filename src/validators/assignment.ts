import { z } from "zod";

// ─── Question Type Row ────────────────────────────────────────────────────────
export const QuestionTypeSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1, "Question type cannot be empty"),
  count: z
    .number({ invalid_type_error: "Count must be a number" })
    .int("Count must be a whole number")
    .positive("Count must be greater than zero"),
  marks: z
    .number({ invalid_type_error: "Marks must be a number" })
    .int("Marks must be a whole number")
    .positive("Marks must be greater than zero"),
});

// ─── Create Assignment Form ───────────────────────────────────────────────────
export const CreateAssignmentSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title cannot be empty")
    .max(200, "Title is too long"),

  dueDate: z
    .string({ required_error: "Due date is required" })
    .min(1, "Due date cannot be empty")
    .regex(
      /^\d{2}-\d{2}-\d{4}$/,
      "Due date must be in DD-MM-YYYY format"
    ),

  instructions: z.string().max(1000, "Instructions too long").optional(),

  questionTypes: z
    .array(QuestionTypeSchema)
    .min(1, "At least one question type is required"),
});

export type CreateAssignmentFormData = z.infer<typeof CreateAssignmentSchema>;

// ─── Validation helper ────────────────────────────────────────────────────────
export function validateCreateAssignment(data: unknown):
  | { success: true; data: CreateAssignmentFormData }
  | { success: false; errors: Record<string, string> } {
  const result = CreateAssignmentSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const [path, issues] of Object.entries(result.error.flatten().fieldErrors)) {
    errors[path] = issues?.[0] ?? "Invalid value";
  }
  return { success: false, errors };
}
