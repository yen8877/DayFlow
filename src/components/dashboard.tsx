"use client";

import { CalendarView } from "@/components/calendar/calendar-view";
import { AppShell } from "@/components/layout/app-shell";
import { SortableTaskList } from "@/components/tasks/sortable-task-list";
import { useTasks, useTimeBlocks } from "@/hooks/use-tasks";
import { useUser } from "@/hooks/use-user";

export function Dashboard() {
  const userQuery = useUser();
  const tasksQuery = useTasks();
  const timeBlocksQuery = useTimeBlocks();

  const user = userQuery.data;
  const tasks = tasksQuery.data ?? [];

  const events =
    timeBlocksQuery.data?.map((block) => ({
      id: block.id,
      title: block.title,
      start: block.starts_at,
      end: block.ends_at,
      backgroundColor: block.color ?? undefined,
    })) ?? [];

  const displayName =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email ??
    "User";

  return (
    <AppShell title="Overview" userLabel={displayName}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
        <section id="overview" className="scroll-mt-20">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight">Today</h2>
            <p className="text-sm text-muted-foreground">
              Plan your day with tasks and time blocks in one calm workspace.
            </p>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <section id="tasks" className="scroll-mt-20">
            <SortableTaskList
              initialTasks={tasks}
              isLoading={tasksQuery.isLoading}
            />
          </section>

          <section id="calendar" className="scroll-mt-20">
            <CalendarView events={events} />
          </section>
        </div>
      </div>
    </AppShell>
  );
}
