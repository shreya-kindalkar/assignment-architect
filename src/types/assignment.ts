export interface Assignment {
  id: string;
  title: string;
  assignedOn: string;
  due: string;
}

export interface QuestionTypeRowData {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export interface QuestionPaperSection {
  title: string;
  instruction?: string;
  questions: QuestionPaperItem[];
}

export interface QuestionPaperItem {
  number: number;
  difficulty: "Easy" | "Moderate" | "Challenging";
  text: string;
  marks: number;
}
