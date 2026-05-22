import { Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuestionPaperSection } from "@/types/assignment";

export interface GeneratedPaperProps {
  school: string;
  subject: string;
  classLabel: string;
  timeAllowed: string;
  maxMarks: number;
  sections: QuestionPaperSection[];
  answerKey?: { number: number; text: string }[];
  aiNote?: string;
  onDownload?: () => void;
}

const difficultyStyles = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  Challenging: "bg-rose-50 text-rose-700 border-rose-200",
};

function DifficultyBadge({ d }: { d: keyof typeof difficultyStyles }) {
  return (
    <span className={cn("inline-flex items-center text-[10px] font-medium border rounded px-1.5 py-0.5 mr-1.5 align-middle", difficultyStyles[d])}>
      {d}
    </span>
  );
}

export function GeneratedPaper({
  school,
  subject,
  classLabel,
  timeAllowed,
  maxMarks,
  sections,
  answerKey,
  aiNote,
  onDownload,
}: GeneratedPaperProps) {
  return (
    <div className="px-4 sm:px-8 py-6 max-w-[1000px] mx-auto w-full">
      {aiNote && (
        <div className="mb-5 rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full bg-brand-soft grid place-items-center shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
            </div>
            <p className="text-sm text-foreground leading-relaxed">{aiNote}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90"
            >
              <Download className="h-4 w-4" /> Download as PDF
            </button>
          </div>
        </div>
      )}

      <article className="bg-surface border border-border rounded-xl shadow-sm px-6 sm:px-14 py-10 sm:py-14 font-serif text-[13.5px] leading-relaxed text-foreground">
        <header className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold">{school}</h1>
          <p>Subject: {subject}</p>
          <p>Class: {classLabel}</p>
        </header>

        <div className="mt-7 flex items-center justify-between text-[13px]">
          <span>Time Allowed: {timeAllowed}</span>
          <span>Maximum Marks: {maxMarks}</span>
        </div>

        <p className="mt-5 text-[13px]">All questions are compulsory unless stated otherwise.</p>

        <div className="mt-5 space-y-2 text-[13px]">
          <p>Name: ______________________</p>
          <p>Roll Number: __________________</p>
          <p>Class: {classLabel} Section: ________</p>
        </div>

        {sections.map((sec) => (
          <section key={sec.title} className="mt-8">
            <h2 className="text-center text-[15px] font-semibold">{sec.title}</h2>
            <div className="mt-4">
              <h3 className="text-[14px] font-semibold">Short Answer Questions</h3>
              {sec.instruction && <p className="italic text-muted-foreground text-[12.5px]">{sec.instruction}</p>}
              <ol className="mt-3 space-y-2.5 list-decimal pl-5">
                {sec.questions.map((q) => (
                  <li key={q.number}>
                    <DifficultyBadge d={q.difficulty} />
                    {q.text} <span className="text-muted-foreground">[{q.marks} Marks]</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ))}

        <p className="mt-8 font-semibold text-[13px]">End of Question Paper</p>

        {answerKey && answerKey.length > 0 && (
          <section className="mt-10">
            <h2 className="text-[15px] font-semibold">Answer Key:</h2>
            <ol className="mt-3 space-y-2 list-decimal pl-5 text-[13px]">
              {answerKey.map((a) => (
                <li key={a.number}>{a.text}</li>
              ))}
            </ol>
          </section>
        )}
      </article>
    </div>
  );
}
