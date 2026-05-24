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
  { key: "library", label: "My Library", icon: Clock, count: 22 },
];

export function AppSidebar({ activeKey = "assignments", onCreate, onNavigate }: AppSidebarProps) {
  return (
    <aside className="hidden lg:flex w-[210px] shrink-0 flex-col border-r border-[#e8e8e8] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-white grid place-items-center text-[11px] font-bold">
            V
          </div>
          <span className="text-[14px] font-bold tracking-tight">VedaAI</span>
        </div>
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={onCreate}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-brand bg-transparent text-foreground hover:bg-brand/5 transition-colors text-[10px] font-semibold py-2"
        >
          <Plus className="h-3 w-3" strokeWidth={3} /> Create Assignment
        </button>
      </div>

      <nav className="px-3 pt-1 space-y-1 flex-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate?.(item.key)}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] transition-colors",
                active
                  ? "bg-gray-100 text-foreground font-medium"
                  : "text-muted-foreground hover:bg-gray-50 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span className="flex-1 text-left truncate">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-[9px] font-bold rounded-full bg-brand text-white min-w-[19px] h-[19px] px-1.5 grid place-items-center leading-none">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <button className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] text-muted-foreground hover:bg-gray-50 hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" strokeWidth={1.5} /> Settings
        </button>
        <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-[#e5e5e5] bg-gray-50/40 px-3 py-2.5">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-300 to-rose-400 grid place-items-center text-[10px] font-bold text-white shrink-0">
            DP
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold truncate leading-tight">Delhi Public School</div>
            <div className="text-[9px] text-muted-foreground truncate leading-tight mt-0.5">
              Bokaro Steel City
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
