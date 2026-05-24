import { Schema, model, Document } from "mongoose";

export interface IQuestionType {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
  title: string;
  dueDate: string;
  uploadedFiles: string[];
  questionTypes: IQuestionType[];
  instructions?: string;
  totalQuestions: number;
  totalMarks: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeSchema = new Schema<IQuestionType>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marks: { type: Number, required: true }
}, { _id: false });

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true, trim: true },
  dueDate: { type: String, required: true },
  uploadedFiles: [{ type: String }],
  questionTypes: [QuestionTypeSchema],
  instructions: { type: String },
  totalQuestions: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending"
  }
}, {
  timestamps: true
});

export const Assignment = model<IAssignment>("Assignment", AssignmentSchema);
