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
  Easy: "text-foreground",
  Moderate: "text-foreground",
  Challenging: "text-foreground",
};

function DifficultyTag({ d }: { d: keyof typeof difficultyStyles }) {
  return (
    <span className={cn("text-[12px] font-medium", difficultyStyles[d])}>[{d}]</span>
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
    <div className="px-4 py-3 pb-10">
      {aiNote && (
        <div className="mb-3 rounded-lg bg-foreground text-background px-4 py-2.5">
          <div className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-80" />
            <p className="text-[11px] leading-relaxed">{aiNote}</p>
          </div>
        </div>
      )}

      <button
        onClick={onDownload}
        className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3.5 py-1.5 text-[11px] font-medium hover:bg-foreground/90"
      >
        <Download className="h-3 w-3" /> Download as PDF
      </button>

      <article className="bg-white border border-[#e5e5e5] rounded-lg shadow-sm px-8 sm:px-12 py-6 sm:py-8 font-serif text-[11px] leading-relaxed text-foreground">
        <header className="text-center space-y-1 border-b border-[#e5e5e5] pb-3">
          <h1 className="text-[14px] sm:text-[15px] font-bold uppercase tracking-wide">{school}</h1>
          <p className="text-[11px] font-medium">Subject: {subject}</p>
          <p className="text-[11px] font-medium">Class: {classLabel}</p>
        </header>

        <div className="mt-3 flex items-center justify-between text-[11px] border-b border-[#e5e5e5] pb-2">
          <span><strong>Time Allowed:</strong> {timeAllowed}</span>
          <span><strong>Maximum Marks:</strong> {maxMarks}</span>
        </div>

        <p className="mt-3 text-[11px] italic text-muted-foreground">All questions are compulsory unless stated otherwise.</p>

        <div className="mt-3 space-y-0.5 text-[11px] border border-[#e5e5e5] rounded p-2 bg-gray-50/50">
          <p>Name: ______________________________</p>
          <p>Roll Number: ______________________________</p>
          <p>Class: {classLabel} &nbsp;&nbsp;&nbsp; Section: __________</p>
        </div>

        {sections.map((sec, idx) => (
          <section key={sec.title} className="mt-5">
            <h2 className="text-center text-[12px] font-bold uppercase tracking-wide border-b border-[#e5e5e5] pb-1">{sec.title}</h2>
            <div className="mt-3">
              <h3 className="text-[11px] font-semibold">Short Answer Questions</h3>
              {sec.instruction && (
                <p className="italic text-muted-foreground text-[10px] mt-0.5">{sec.instruction}</p>
              )}
              <ol className="mt-2 space-y-2 list-decimal pl-5">
                {sec.questions.map((q) => (
                  <li key={q.number} className="text-[11px] leading-relaxed">
                    {q.text}{" "}
                    <span className="text-[10px] text-muted-foreground font-sans">
                      [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                    </span>
                    {" "}
                    <span className="text-[10px] text-muted-foreground font-sans italic">
                      ({q.difficulty})
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ))}

        <p className="mt-6 font-semibold text-[11px] text-center border-t border-[#e5e5e5] pt-3">— End of Question Paper —</p>

        {answerKey && answerKey.length > 0 && (
          <section className="mt-6 border-t-2 border-[#e5e5e5] pt-4">
            <h2 className="text-[12px] font-bold uppercase tracking-wide">Answer Key</h2>
            <ol className="mt-2 space-y-1.5 list-decimal pl-5 text-[11px]">
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
