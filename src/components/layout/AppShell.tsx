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
    <div className="min-h-dvh bg-canvas p-2">
      <div className="dashboard-shell w-[96%] max-w-none mx-auto flex min-h-[calc(100dvh-16px)]">
        <AppSidebar activeKey={activeKey} onCreate={onCreate} />
        <div className="flex-1 min-w-0 flex flex-col bg-shell-main min-h-0">
          <TopBar title={title} showBack={showBack} onBack={onBack} />
          <main className="flex-1 min-h-0 overflow-y-auto relative pb-[4rem] lg:pb-0">{children}</main>
        </div>
      </div>
      <MobileBottomNav activeKey={activeKey} />
    </div>
  );
}
