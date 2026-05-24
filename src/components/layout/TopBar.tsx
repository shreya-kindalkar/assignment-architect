import { ArrowLeft, Bell, ChevronDown } from "lucide-react";

export interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function TopBar({ title, showBack, onBack }: TopBarProps) {
  return (
    <header className="h-11 shrink-0 border-b border-[#ececec] bg-white px-3 flex items-center gap-2">
      {showBack && (
        <button
          onClick={onBack}
          className="h-6 w-6 grid place-items-center rounded hover:bg-gray-100 text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}
      <h1 className="text-[11px] font-medium text-muted-foreground">{title}</h1>
      <div className="ml-auto flex items-center gap-1.5">
        <button className="relative h-7 w-7 grid place-items-center rounded-full hover:bg-gray-100">
          <Bell className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand" />
        </button>
        <button className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100">
          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-orange-300 to-rose-400 shrink-0" />
          <span className="text-[11px] font-medium hidden sm:inline">John Doe</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}
