import { Schema, model, Document, Types } from "mongoose";

export interface IQuestionItem {
  number: number;
  text: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  marks: number;
}

export interface IQuestionSection {
  title: string;
  instruction?: string;
  questions: IQuestionItem[];
}

export interface IAnswerKeyItem {
  number: number;
  text: string;
}

export interface IGeneratedPaper extends Document {
  assignmentId: Types.ObjectId;
  sections: IQuestionSection[];
  difficulty: string;
  marks: number;
  answerKey: IAnswerKeyItem[];
  generationMetadata: {
    timeSpentMs?: number;
    modelName?: string;
    promptTokens?: number;
    completionTokens?: number;
  };
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionItemSchema = new Schema<IQuestionItem>({
  number: { type: Number, required: true },
  text: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Moderate", "Challenging"], required: true },
  marks: { type: Number, required: true }
}, { _id: false });

const QuestionSectionSchema = new Schema<IQuestionSection>({
  title: { type: String, required: true },
  instruction: { type: String },
  questions: [QuestionItemSchema]
}, { _id: false });

const AnswerKeyItemSchema = new Schema<IAnswerKeyItem>({
  number: { type: Number, required: true },
  text: { type: String, required: true }
}, { _id: false });

const GeneratedPaperSchema = new Schema<IGeneratedPaper>({
  assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true, unique: true },
  sections: [QuestionSectionSchema],
  difficulty: { type: String, required: true },
  marks: { type: Number, required: true },
  answerKey: [AnswerKeyItemSchema],
  generationMetadata: {
    timeSpentMs: { type: Number },
    modelName: { type: String },
    promptTokens: { type: Number },
    completionTokens: { type: Number }
  },
  pdfUrl: { type: String }
}, {
  timestamps: true
});

export const GeneratedPaper = model<IGeneratedPaper>("GeneratedPaper", GeneratedPaperSchema);
