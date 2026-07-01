"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  EditModeActions,
  EditModeHeader,
  EditModeToggle,
} from "@/components/layout/edit-mode-controls";

interface AppTopBarProps {
  userLabel?: string;
}

export function AppTopBar({ userLabel }: AppTopBarProps) {
  return (
    <EditModeHeader>
      <div className="flex w-full items-center gap-2">
        <EditModeActions />
        <div className="ml-auto flex items-center gap-1">
        {userLabel ? (
            <span className="hidden max-w-32 truncate rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground sm:inline dark:bg-[#3a3a3c]">
              {userLabel}
            </span>
          ) : null}
          <EditModeToggle />
          <ThemeToggle />
          <SignOutButton />
        </div>
      </div>
    </EditModeHeader>
  );
}
