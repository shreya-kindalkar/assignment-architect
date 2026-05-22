import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { MobileBottomNav } from "./MobileBottomNav";

export interface AppShellProps {
  children: ReactNode;
  title: string;
  activeKey?: string;
  showBack?: boolean;
  onBack?: () => void;
  onCreate?: () => void;
}

export function AppShell({ children, title, activeKey, showBack, onBack, onCreate }: AppShellProps) {
  return (
    <div className="min-h-screen flex bg-surface-muted">
      <AppSidebar activeKey={activeKey} onCreate={onCreate} />
      <div className="flex-1 min-w-0 flex flex-col pb-20 lg:pb-0">
        <TopBar title={title} showBack={showBack} onBack={onBack} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <MobileBottomNav activeKey={activeKey} />
    </div>
  );
}
