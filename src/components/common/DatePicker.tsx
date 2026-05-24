/**
 * Production date picker — shadcn Calendar inside a Popover.
 * Outputs DD-MM-YYYY string to match backend format.
 */
import { useState } from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;           // DD-MM-YYYY
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  // Parse DD-MM-YYYY → Date for the calendar
  const parsed = value
    ? parse(value, "dd-MM-yyyy", new Date())
    : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "dd-MM-yyyy"));
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full h-10 rounded-lg border border-[#e5e5e5] bg-white px-4 pr-11 text-[12px] text-left",
            "focus:outline-none focus:ring-2 focus:ring-brand/20",
            "hover:border-gray-300 transition-colors",
            "relative flex items-center",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="flex-1 truncate">{value || placeholder}</span>
          <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border border-[#e5e5e5] shadow-lg rounded-xl"
        align="start"
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
        />
      </PopoverContent>
    </Popover>
  );
}
