import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";

interface AppShellProps {
  children: React.ReactNode;
  userLabel?: string;
}

export function AppShell({ children, userLabel }: AppShellProps) {
  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopBar userLabel={userLabel} />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
