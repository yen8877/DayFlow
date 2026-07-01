import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  userLabel?: string;
}

export function AppShell({
  children,
  title,
  subtitle,
  userLabel,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar title={title} subtitle={subtitle} userLabel={userLabel} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
