import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

export function SearchInput({ className, wrapperClassName, ...props }: SearchInputProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        strokeWidth={2}
      />
      <input
        {...props}
        className={cn(
          "w-full h-9 rounded-full border border-[#e5e5e5] bg-white pl-10 pr-4 text-[11px]",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30",
          "transition-colors",
          className
        )}
      />
    </div>
  );
}
