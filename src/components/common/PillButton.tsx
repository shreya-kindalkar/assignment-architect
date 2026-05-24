import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "dark" | "ghost" | "outline";

export interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  dark: "bg-foreground text-background hover:bg-foreground/90",
  ghost: "bg-transparent text-foreground hover:bg-gray-100",
  outline: "border border-[#e5e5e5] bg-white text-foreground hover:bg-gray-50",
};

export function PillButton({
  variant = "dark",
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...props
}: PillButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[11px] font-medium transition-colors",
        variantClasses[variant],
        className,
      )}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
