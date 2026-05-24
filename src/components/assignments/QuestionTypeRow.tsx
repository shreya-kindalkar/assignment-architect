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
    <div className="grid grid-cols-[1fr_140px_100px_40px] gap-4 items-center">
      <div className="min-w-0">
        <div className="relative">
          <select
            value={data.type}
            onChange={(e) => onChange({ ...data, type: e.target.value })}
            className="w-full h-10 rounded-lg border border-[#e5e5e5] bg-white pl-4 pr-10 text-[12px] appearance-none focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center justify-center">
        <NumberStepper value={data.count} onChange={(v) => onChange({ ...data, count: v })} />
      </div>
      
      <div className="flex items-center justify-center">
        <NumberStepper value={data.marks} onChange={(v) => onChange({ ...data, marks: v })} />
      </div>
      
      <button
        type="button"
        onClick={onRemove}
        className="h-8 w-8 grid place-items-center rounded text-muted-foreground hover:bg-gray-100 hover:text-rose-600"
        aria-label="Remove"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
}
