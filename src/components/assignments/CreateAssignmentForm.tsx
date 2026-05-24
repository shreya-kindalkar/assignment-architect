import { useState } from "react";
import { ArrowLeft, ArrowRight, Mic, Plus } from "lucide-react";
import { UploadDropzone } from "./UploadDropzone";
import { QuestionTypeRow } from "./QuestionTypeRow";
import { PillButton } from "@/components/common/PillButton";
import { DatePicker } from "@/components/common/DatePicker";
import type { QuestionTypeRowData } from "@/types/assignment";

const initialRows: QuestionTypeRowData[] = [
  { id: "1", type: "Multiple Choice Questions", count: 4, marks: 1 },
  { id: "2", type: "Short Questions", count: 3, marks: 2 },
  { id: "3", type: "Diagram/Graph-Based Questions", count: 5, marks: 5 },
  { id: "4", type: "Numerical Problems", count: 5, marks: 5 },
];

export function CreateAssignmentForm({
  onSubmit,
}: {
  onSubmit?: (data: {
    title: string;
    dueDate: string;
    instructions?: string;
    questionTypes: Array<{ type: string; count: number; marks: number }>;
  }) => void;
}) {
  const [rows, setRows] = useState(initialRows);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalQ = rows.reduce((s, r) => s + r.count, 0);
  const totalM = rows.reduce((s, r) => s + r.count * r.marks, 0);

  const updateRow = (id: string, next: QuestionTypeRowData) =>
    setRows((r) => r.map((row) => (row.id === id ? next : row)));
  const removeRow = (id: string) => setRows((r) => r.filter((row) => row.id !== id));
  const addRow = () =>
    setRows((r) => [
      ...r,
      { id: crypto.randomUUID(), type: "Short Questions", count: 1, marks: 1 },
    ]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Please enter a title for the assignment.");
      return;
    }
    if (!dueDate.trim()) {
      setError("Please select a due date.");
      return;
    }
    setError(null);
    onSubmit?.({
      title: title.trim(),
      dueDate: dueDate.trim(),
      instructions: info.trim() || undefined,
      questionTypes: rows.map((r) => ({
        type: r.type,
        count: r.count,
        marks: r.marks,
      })),
    });
  };

  return (
    <div className="px-6 py-4 pb-10">
      <div className="flex items-start gap-2 mb-4">
        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
        <div>
          <h2 className="text-[15px] font-semibold leading-tight">Create Assignment</h2>
          <p className="text-[12px] text-muted-foreground leading-tight">
            Set up a new assignment for your students.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-100 p-3 text-[11px] text-rose-600 font-medium">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[#e5e5e5] bg-white overflow-hidden shadow-sm">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div className="h-full w-1/3 bg-gray-400" />
        </div>

        <div className="p-6">
          <section className="mb-5">
            <h3 className="text-[13px] font-semibold leading-tight">Assignment Details</h3>
            <p className="text-[11px] text-muted-foreground">
              Basic information about your assignment.
            </p>
          </section>

          {/* Title */}
          <div className="mb-5">
            <label className="block text-[12px] font-medium mb-2">Assignment Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Quiz: Chemical Effects of Current"
              className="w-full h-10 rounded-lg border border-[#e5e5e5] bg-white px-4 text-[12px]
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {/* File upload */}
          <div className="mb-5">
            <UploadDropzone />
          </div>

          {/* Due date — calendar picker */}
          <div className="mb-5">
            <label className="block text-[12px] font-medium mb-2">Due Date</label>
            <div className="max-w-sm">
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="Select due date"
              />
            </div>
          </div>

          {/* Question type table header */}
          <div className="mb-3 grid grid-cols-[1fr_140px_100px_40px] gap-4 text-[11px] font-semibold text-foreground">
            <span>Question Type</span>
            <span className="text-center">No. of Questions</span>
            <span className="text-center">Marks</span>
            <span />
          </div>

          {/* Question type rows */}
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
            className="mt-4 inline-flex items-center gap-2 text-[12px] font-medium text-foreground hover:text-brand cursor-pointer"
          >
            <span className="h-6 w-6 rounded-full bg-foreground text-background grid place-items-center">
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            Add Question Type
          </button>

          {/* Totals */}
          <div className="mt-4 flex justify-end gap-x-6 text-[11px] text-muted-foreground">
            <span>
              Total Questions:{" "}
              <span className="font-bold text-foreground">{totalQ}</span>
            </span>
            <span>
              Total Marks:{" "}
              <span className="font-bold text-foreground">{totalM}</span>
            </span>
          </div>

          {/* Additional instructions */}
          <div className="mt-5">
            <label className="block text-[12px] font-medium mb-2">
              Additional Information{" "}
              <span className="text-muted-foreground font-normal">(For better output)</span>
            </label>
            <div className="relative">
              <textarea
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                placeholder="e.g. Generate a question paper for 3 hour exam duration..."
                rows={3}
                className="w-full rounded-lg border border-[#e5e5e5] bg-white p-4 pr-12 text-[12px]
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/20
                  resize-none min-h-[80px]"
              />
              <button
                type="button"
                className="absolute right-4 bottom-4 h-7 w-7 grid place-items-center rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <Mic className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <PillButton
          variant="outline"
          leadingIcon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />}
        >
          Previous
        </PillButton>
        <PillButton
          trailingIcon={<ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />}
          onClick={handleSubmit}
        >
          Next
        </PillButton>
      </div>
    </div>
  );
}
