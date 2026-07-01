"use client";

import { CalendarDays, CheckSquare, LayoutGrid } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
] as const;

interface AppSidebarProps {
  active?: (typeof navItems)[number]["id"];
}

export function AppSidebar({ active = "overview" }: AppSidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar backdrop-blur-xl dark:backdrop-saturate-150">
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground dark:shadow-sm">
          D
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">DayFlow</p>
          <p className="truncate text-xs text-muted-foreground">Focus & schedule</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
