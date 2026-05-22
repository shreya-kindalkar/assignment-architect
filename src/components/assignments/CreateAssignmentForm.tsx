import { useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Mic, Plus } from "lucide-react";
import { UploadDropzone } from "./UploadDropzone";
import { QuestionTypeRow } from "./QuestionTypeRow";
import { PillButton } from "@/components/common/PillButton";
import type { QuestionTypeRowData } from "@/types/assignment";

const initialRows: QuestionTypeRowData[] = [
  { id: "1", type: "Multiple Choice Questions", count: 4, marks: 1 },
  { id: "2", type: "Short Questions", count: 3, marks: 2 },
  { id: "3", type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
  { id: "4", type: "Numerical Problems", count: 5, marks: 5 },
];

export function CreateAssignmentForm({ onSubmit }: { onSubmit?: () => void }) {
  const [rows, setRows] = useState(initialRows);
  const [dueDate, setDueDate] = useState("");
  const [info, setInfo] = useState("");

  const totalQ = rows.reduce((s, r) => s + r.count, 0);
  const totalM = rows.reduce((s, r) => s + r.count * r.marks, 0);

  const updateRow = (id: string, next: QuestionTypeRowData) =>
    setRows((r) => r.map((row) => (row.id === id ? next : row)));
  const removeRow = (id: string) => setRows((r) => r.filter((row) => row.id !== id));
  const addRow = () =>
    setRows((r) => [...r, { id: crypto.randomUUID(), type: "Short Questions", count: 1, marks: 1 }]);

  return (
    <div className="px-4 sm:px-8 py-6 max-w-[1100px] mx-auto w-full">
      <div className="flex items-start gap-2 mb-6">
        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Create Assignment</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Set up a new assignment for your students</p>
        </div>
      </div>

      <div className="border-b border-border mb-8">
        <div className="inline-flex border-b-2 border-foreground pb-3 text-sm font-medium">Step 1 — Details</div>
      </div>

      <section className="space-y-2 mb-8">
        <h3 className="text-[15px] font-semibold">Assignment Details</h3>
        <p className="text-xs text-muted-foreground">Basic information about your assignment</p>
      </section>

      <div className="mb-8">
        <UploadDropzone />
      </div>

      <div className="mb-8">
        <label className="block text-[13px] font-medium mb-2">Due Date</label>
        <div className="relative max-w-md">
          <input
            type="text"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            placeholder="DD-MM-YYYY"
            className="w-full h-11 rounded-lg border border-border bg-surface px-4 pr-11 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="mb-3 hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 text-[12px] font-medium text-foreground px-1">
        <span>Question Type</span>
        <span className="text-center w-[120px]">No. of Questions</span>
        <span className="text-center w-[120px]">Marks</span>
        <span className="w-9" />
      </div>

      <div className="space-y-3">
        {rows.map((r, i) => (
          <QuestionTypeRow
            key={r.id}
            data={r}
            onChange={(n) => updateRow(r.id, n)}
            onRemove={() => removeRow(r.id)}
            showLabels={i === 0}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-brand"
      >
        <span className="h-6 w-6 rounded-full bg-foreground text-background grid place-items-center">
          <Plus className="h-3.5 w-3.5" />
        </span>
        Add Question Type
      </button>

      <div className="mt-5 flex flex-col items-end text-[13px] text-muted-foreground gap-0.5">
        <span>
          Total Questions : <span className="font-semibold text-foreground">{totalQ}</span>
        </span>
        <span>
          Total Marks : <span className="font-semibold text-foreground">{totalM}</span>
        </span>
      </div>

      <div className="mt-8">
        <label className="block text-[13px] font-medium mb-2">
          Additional Information <span className="text-muted-foreground font-normal">(For better output)</span>
        </label>
        <div className="relative">
          <textarea
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            placeholder="e.g. Generate a question paper for 3 hour exam duration..."
            rows={3}
            className="w-full rounded-xl border border-border bg-surface p-4 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
          />
          <button className="absolute right-3 bottom-3 h-8 w-8 grid place-items-center rounded-full bg-secondary hover:bg-secondary/70">
            <Mic className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <PillButton variant="outline" leadingIcon={<ArrowLeft className="h-4 w-4" />}>
          Previous
        </PillButton>
        <PillButton trailingIcon={<ArrowRight className="h-4 w-4" />} onClick={onSubmit}>
          Next
        </PillButton>
      </div>
    </div>
  );
}
