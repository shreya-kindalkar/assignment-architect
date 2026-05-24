import { z } from "zod";

export const CreateAssignmentZodSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title cannot be empty")
    .trim(),
  dueDate: z
    .string({ required_error: "Due date is required" })
    .min(1, "Due date cannot be empty"),
  instructions: z.string().optional(),
  uploadedFiles: z.array(z.string()).default([]),
  questionTypes: z
    .array(
      z.object({
        id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
        type: z.string().min(1, "Question type title cannot be empty"),
        count: z.number().int().positive("Question count must be greater than zero"),
        marks: z.number().int().positive("Marks per question must be greater than zero")
      })
    )
    .min(1, "At least one question type must be specified")
});

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentZodSchema>;
