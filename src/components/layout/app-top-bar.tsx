"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface AppTopBarProps {
  title: string;
  subtitle?: string;
  userLabel?: string;
}

export function AppTopBar({ title, subtitle, userLabel }: AppTopBarProps) {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-sidebar-border bg-sidebar px-6 backdrop-blur-xl dark:backdrop-saturate-150">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
        <p className="truncate text-xs text-muted-foreground">
          {subtitle ?? today}
        </p>
      </div>

      <div className="flex items-center gap-1">
        {userLabel ? (
          <span className="hidden max-w-32 truncate rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline dark:bg-[#3a3a3c]">
            {userLabel}
          </span>
        ) : null}
        <ThemeToggle />
        <SignOutButton />
      </div>
    </header>
  );
}
