import { LayoutGrid, Users, FileText, Wrench, Clock, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppSidebarProps {
  activeKey?: string;
  onCreate?: () => void;
  onNavigate?: (key: string) => void;
}

const NAV = [
  { key: "home", label: "Home", icon: LayoutGrid },
  { key: "groups", label: "My Groups", icon: Users },
  { key: "assignments", label: "Assignments", icon: FileText, count: 10 },
  { key: "toolkit", label: "AI Teacher's Toolkit", icon: Wrench },
  { key: "library", label: "My Library", icon: Clock },
];

export function AppSidebar({ activeKey = "assignments", onCreate, onNavigate }: AppSidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-surface h-screen sticky top-0">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-foreground text-background grid place-items-center text-[11px] font-bold">V</div>
          <span className="font-semibold tracking-tight">VedaAI</span>
        </div>
      </div>

      <div className="px-4">
        <button
          onClick={onCreate}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand text-brand bg-brand-soft/40 hover:bg-brand-soft transition-colors text-sm font-medium py-2.5"
        >
          <Plus className="h-4 w-4" /> Create Assignment
        </button>
      </div>

      <nav className="px-3 mt-5 flex-1 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate?.(item.key)}
              className={cn(
                "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-[11px] font-semibold rounded-full bg-brand text-brand-foreground px-2 py-0.5">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-2">
        <button className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors">
          <Settings className="h-[18px] w-[18px]" /> Settings
        </button>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted px-3 py-2.5">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-300 to-rose-400 grid place-items-center text-xs font-bold text-white">
            DP
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">Delhi Public School</div>
            <div className="text-[11px] text-muted-foreground truncate">Bokaro Steel City</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
