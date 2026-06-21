"use client";

import type { EventInput } from "@fullcalendar/core";

import { CalendarView } from "@/components/calendar/calendar-view";
import { SortableTaskList } from "@/components/tasks/sortable-task-list";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTasks, useTimeBlocks } from "@/hooks/use-tasks";
import type { Task } from "@/types/database";

const demoTasks: Task[] = [
  {
    id: "demo-1",
    user_id: "demo",
    title: "Review weekly goals",
    description: "Align priorities for the week ahead",
    status: "todo",
    position: 0,
    scheduled_start: null,
    scheduled_end: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    user_id: "demo",
    title: "Deep work block",
    description: "Focus session for core project",
    status: "in_progress",
    position: 1,
    scheduled_start: null,
    scheduled_end: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    user_id: "demo",
    title: "Wrap up and plan tomorrow",
    description: null,
    status: "todo",
    position: 2,
    scheduled_start: null,
    scheduled_end: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoEvents: EventInput[] = [
  {
    id: "block-1",
    title: "Morning focus",
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
  },
  {
    id: "block-2",
    title: "Team sync",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
  },
];

export function Dashboard() {
  const tasksQuery = useTasks();
  const timeBlocksQuery = useTimeBlocks();

  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const tasks =
    hasSupabase && !tasksQuery.isError ? tasksQuery.data ?? [] : demoTasks;

  const events: EventInput[] =
    hasSupabase && !timeBlocksQuery.isError && timeBlocksQuery.data?.length
      ? timeBlocksQuery.data.map((block) => ({
          id: block.id,
          title: block.title,
          start: block.starts_at,
          end: block.ends_at,
          backgroundColor: block.color ?? undefined,
        }))
      : demoEvents;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">DayFlow</h1>
          <Badge variant="secondary">Full Stack Ready</Badge>
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Execution-focused productivity — task management, scheduling, and
          time blocking in one place.
        </p>
        {!hasSupabase ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Add Supabase env vars to connect your database. Demo data is shown
            until then.
          </p>
        ) : null}
      </header>

      <Separator />

      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        <SortableTaskList initialTasks={tasks} />
        <CalendarView events={events} />
      </div>
    </div>
  );
}
