"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";

import { SidebarEditPanel } from "@/components/layout/sidebar-edit-panel";
import { SidebarFilterItem } from "@/components/layout/sidebar-filter-item";
import { useCalendarFilters } from "@/providers/calendar-filter-provider";
import { useWorkspaceEdit } from "@/providers/workspace-edit-provider";
import { cn } from "@/lib/utils";

const COLLAPSED_WIDTH = 56;
const DEFAULT_WIDTH = 224;
const MIN_WIDTH = 180;
const MAX_WIDTH = 360;
const DATE_HEADER_CLASS =
  "relative flex h-14 shrink-0 items-center justify-center";

function formatMonthDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}.${day}`;
}

function getWeekendColor(day: number) {
  if (day === 6) return "text-[#0a84ff]";
  if (day === 0) return "text-[#c41e3a]";
  return "text-foreground";
}

export function AppSidebar() {
  const now = new Date();
  const {
    groups,
    collapsedGroups,
    toggleVisibility,
    updateFilterColor,
    updateFilterLabel,
    deleteFilter,
    toggleGroupCollapsed,
  } = useCalendarFilters();
  const { isEditMode, draftGroups } = useWorkspaceEdit();
  const displayGroups = isEditMode ? draftGroups : groups;
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  const dayNumber = now.getDate();
  const monthDay = formatMonthDay(now);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const weekdayShort = new Intl.DateTimeFormat("en-US", { weekday: "short" })
    .format(now)
    .toUpperCase();
  const weekendColor = getWeekendColor(now.getDay());

  const sidebarWidth = isCollapsed ? COLLAPSED_WIDTH : width;

  const handleResizeStart = useCallback(
    (event: React.MouseEvent) => {
      if (isCollapsed) return;

      event.preventDefault();
      const startX = event.clientX;
      const startWidth = width;

      function onMouseMove(moveEvent: MouseEvent) {
        const nextWidth = startWidth + (moveEvent.clientX - startX);
        setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, nextWidth)));
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [isCollapsed, width],
  );

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col overflow-x-hidden border-r backdrop-blur-xl dark:backdrop-saturate-150",
        isEditMode
          ? "border-primary/30 bg-primary/5"
          : "border-sidebar-border bg-sidebar",
      )}
      style={{ width: sidebarWidth }}
    >
      {isCollapsed ? (
        <div className={cn(DATE_HEADER_CLASS, "group px-2")}>
          <div className="flex flex-col items-center gap-0.5">
            <span
              suppressHydrationWarning
              className={cn("text-2xl font-semibold tabular-nums leading-none", weekendColor)}
            >
              {dayNumber}
            </span>
            <span
              suppressHydrationWarning
              className={cn("text-[10px] font-bold leading-none tracking-wide", weekendColor)}
            >
              {weekdayShort}
            </span>
          </div>
          <button
            type="button"
            aria-label="Expand sidebar"
            className="absolute inset-0 flex items-center justify-center rounded-md bg-sidebar/90 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => setIsCollapsed(false)}
          >
            <ChevronRight className="size-7 stroke-[2.5] text-foreground" />
          </button>
        </div>
      ) : (
        <div className={cn(DATE_HEADER_CLASS, "group px-4")}>
          <div className="flex flex-col items-center text-center">
            <p
              suppressHydrationWarning
              className={cn("text-2xl font-semibold tabular-nums leading-none", weekendColor)}
            >
              {monthDay}
            </p>
            <p
              suppressHydrationWarning
              className={cn("mt-1.5 text-xs font-medium leading-tight", weekendColor)}
            >
              {weekday}
            </p>
          </div>
          <button
            type="button"
            aria-label="Collapse sidebar"
            className="absolute inset-0 flex items-center justify-center rounded-md bg-sidebar/90 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronLeft className="size-7 stroke-[2.5] text-foreground" />
          </button>
        </div>
      )}

      {!isCollapsed && isEditMode ? <SidebarEditPanel /> : null}

      {!isCollapsed && !isEditMode ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {displayGroups.map((group) => {
            const isGroupCollapsed = collapsedGroups[group.id];

            return (
              <section key={group.id} className="mb-3 last:mb-0">
                <button
                  type="button"
                  onClick={() => toggleGroupCollapsed(group.id)}
                  className="flex w-full items-center justify-between px-2 pb-1 text-left"
                >
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {group.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3 shrink-0 text-muted-foreground transition-transform",
                      isGroupCollapsed && "-rotate-90",
                    )}
                  />
                </button>

                {!isGroupCollapsed ? (
                  <ul className="flex flex-col gap-0.5">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <SidebarFilterItem
                          filter={item}
                          onToggleVisibility={toggleVisibility}
                          onColorChange={updateFilterColor}
                          onLabelChange={updateFilterLabel}
                          onDelete={deleteFilter}
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            );
          })}
        </div>
      ) : null}

      {!isCollapsed ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          className="absolute inset-y-0 -right-1 z-10 w-2 cursor-col-resize transition-colors hover:bg-sidebar-border/60"
          onMouseDown={handleResizeStart}
        />
      ) : null}
    </aside>
  );
}
