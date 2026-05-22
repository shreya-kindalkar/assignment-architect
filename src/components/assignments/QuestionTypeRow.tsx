import { ChevronDown, X } from "lucide-react";
import { NumberStepper } from "@/components/common/NumberStepper";
import type { QuestionTypeRowData } from "@/types/assignment";

export interface QuestionTypeRowProps {
  data: QuestionTypeRowData;
  onChange: (next: QuestionTypeRowData) => void;
  onRemove: () => void;
  showLabels?: boolean;
}

const TYPES = [
  "Multiple Choice Questions",
  "Short Questions",
  "Long Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
];

export function QuestionTypeRow({ data, onChange, onRemove, showLabels }: QuestionTypeRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 md:gap-4 items-end md:items-center">
      <div className="min-w-0">
        {showLabels && <label className="block text-[12px] font-medium text-foreground mb-1.5 md:hidden">Question Type</label>}
        <div className="relative">
          <select
            value={data.type}
            onChange={(e) => onChange({ ...data, type: e.target.value })}
            className="w-full h-10 rounded-full border border-border bg-surface pl-4 pr-9 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-3 md:gap-4 items-end">
        <div>
          {showLabels && <label className="block text-[12px] font-medium mb-1.5">No. of Questions</label>}
          <NumberStepper value={data.count} onChange={(v) => onChange({ ...data, count: v })} />
        </div>
        <div>
          {showLabels && <label className="block text-[12px] font-medium mb-1.5">Marks</label>}
          <NumberStepper value={data.marks} onChange={(v) => onChange({ ...data, marks: v })} />
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="h-9 w-9 grid place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-rose-600 self-end md:self-auto"
          aria-label="Remove"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
