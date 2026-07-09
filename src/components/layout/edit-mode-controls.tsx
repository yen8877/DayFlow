"use client";

import { Pencil, X, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWorkspaceEdit } from "@/providers/workspace-edit-provider";
import { cn } from "@/lib/utils";

export function EditModeToggle() {
  const { isEditMode, enterEditMode } = useWorkspaceEdit();

  if (isEditMode) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="size-8 text-muted-foreground hover:text-foreground"
      onClick={enterEditMode}
      aria-label="Enter edit mode"
    >
      <Pencil className="size-4" />
    </Button>
  );
}

export function EditModeActions() {
  const { isEditMode, cancelEditMode, saveEditMode } = useWorkspaceEdit();

  if (!isEditMode) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-md bg-primary/15 px-2 py-1 text-[11px] font-semibold text-primary">
        편집 중
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1"
        onClick={cancelEditMode}
      >
        <X className="size-3.5" />
        취소
      </Button>
      <Button type="button" size="sm" className="h-8 gap-1" onClick={saveEditMode}>
        <Check className="size-3.5" />
        저장
      </Button>
    </div>
  );
}

export function EditModeHeader({ children }: { children: React.ReactNode }) {
  const { isEditMode } = useWorkspaceEdit();

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center px-6 backdrop-blur-xl dark:backdrop-saturate-150",
        isEditMode
          ? "border-primary/30 bg-primary/5"
          : "border-sidebar-border bg-sidebar",
      )}
    >
      {children}
    </header>
  );
}
