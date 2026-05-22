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
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-surface/95 backdrop-blur border-t border-border px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-4 gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              className={cn(
                "flex flex-col items-center gap-1 py-1.5 rounded-md text-[11px]",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.2]")} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
