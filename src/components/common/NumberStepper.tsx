import { Minus, Plus } from "lucide-react";

export interface NumberStepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function NumberStepper({ value, onChange, min = 0, max = 99 }: NumberStepperProps) {
  return (
    <div className="inline-flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-6 w-6 grid place-items-center rounded border border-[#e5e5e5] text-muted-foreground hover:bg-gray-50"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <span className="min-w-[24px] text-center text-[13px] font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-6 w-6 grid place-items-center rounded border border-[#e5e5e5] text-muted-foreground hover:bg-gray-50"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
