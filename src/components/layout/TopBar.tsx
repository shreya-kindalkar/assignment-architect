import { ArrowLeft, Bell, ChevronDown } from "lucide-react";

export interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function TopBar({ title, showBack, onBack }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border bg-surface px-4 sm:px-6 flex items-center gap-3 sticky top-0 z-10">
      {showBack && (
        <button onClick={onBack} className="h-8 w-8 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}
      <h1 className="text-sm font-medium text-muted-foreground">{title}</h1>
      <div className="ml-auto flex items-center gap-3">
        <button className="relative h-9 w-9 grid place-items-center rounded-full hover:bg-secondary">
          <Bell className="h-[18px] w-[18px] text-muted-foreground" />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-brand" />
        </button>
        <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-secondary">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-300 to-rose-400" />
          <span className="text-sm font-medium hidden sm:inline">John Doe</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
