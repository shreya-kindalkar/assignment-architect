import { LayoutGrid, FileText, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { key: "home", label: "Home", icon: LayoutGrid },
  { key: "assignments", label: "Assignments", icon: FileText },
  { key: "library", label: "Library", icon: BookOpen },
  { key: "toolkit", label: "AI Toolkit", icon: Sparkles },
];

export function MobileBottomNav({ activeKey = "assignments" }: { activeKey?: string }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-foreground text-background border-t border-foreground/20 px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1 text-[10px]",
                active ? "text-background" : "text-background/55",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "stroke-[2.25]")} strokeWidth={active ? 2.25 : 1.75} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
