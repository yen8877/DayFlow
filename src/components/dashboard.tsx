"use client";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardPanels } from "@/components/dashboard/dashboard-panels";
import { useTasks, useTimeBlocks } from "@/hooks/use-tasks";
import { useUser } from "@/hooks/use-user";
import { useCalendarFilters } from "@/providers/calendar-filter-provider";
import { useWorkspaceEdit } from "@/providers/workspace-edit-provider";
import { useMemo } from "react";

export function Dashboard() {
  const userQuery = useUser();
  const tasksQuery = useTasks();
  const timeBlocksQuery = useTimeBlocks();
  const { getVisibleFilterIdsByType, getFilterById } = useCalendarFilters();
  const { isEditMode } = useWorkspaceEdit();

  const user = userQuery.data;
  const tasks = tasksQuery.data ?? [];
  const visibleScheduleFilterIds = getVisibleFilterIdsByType("schedules");

  const events = useMemo(() => {
    if (visibleScheduleFilterIds.length === 0) {
      return [];
    }

    const defaultFilterId = visibleScheduleFilterIds[0];
    const defaultFilter = getFilterById(defaultFilterId);

    return (
      timeBlocksQuery.data?.map((block) => ({
        id: block.id,
        title: block.title,
        start: block.starts_at,
        end: block.ends_at,
        backgroundColor: block.color ?? defaultFilter?.color,
        borderColor: block.color ?? defaultFilter?.color,
        extendedProps: {
          filterId: defaultFilterId,
        },
      })) ?? []
    );
  }, [getFilterById, timeBlocksQuery.data, visibleScheduleFilterIds]);

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "User";

  return (
    <AppShell userLabel={displayName}>
      <div
        className={
          isEditMode
            ? "mx-auto flex w-full max-w-7xl flex-col gap-8 overflow-x-hidden rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6"
            : "flex min-h-0 flex-1 flex-col overflow-hidden"
        }
      >
        {isEditMode ? <section id="overview" className="scroll-mt-20" /> : null}

        <DashboardPanels
          tasks={tasks}
          isLoadingTasks={tasksQuery.isLoading}
          events={events}
        />
      </div>
    </AppShell>
  );
}
