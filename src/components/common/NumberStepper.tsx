import { Minus, Plus } from "lucide-react";

export interface NumberStepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function NumberStepper({ value, onChange, min = 0, max = 99 }: NumberStepperProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface h-9 px-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:bg-secondary"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-8 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:bg-secondary"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
