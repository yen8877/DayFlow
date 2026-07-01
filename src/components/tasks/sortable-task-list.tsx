"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Circle, GripVertical } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/database";

type TaskPriority = "p1" | "p2" | "p3" | "p4";

function getTasksSyncKey(tasks: Task[]) {
  return tasks.map((task) => `${task.id}:${task.position}`).join("|");
}

const PRIORITY_STORAGE_KEY = "dayflow-task-priorities";

const priorityLabels: Record<TaskPriority, string> = {
  p1: "P1",
  p2: "P2",
  p3: "P3",
  p4: "P4",
};

const prioritySectionLabels: Record<TaskPriority, string> = {
  p1: "Priority 1",
  p2: "Priority 2",
  p3: "Priority 3",
  p4: "Priority 4",
};

function readStoredPriorities() {
  if (typeof window === "undefined") {
    return {} as Record<string, TaskPriority>;
  }

  try {
    const raw = window.localStorage.getItem(PRIORITY_STORAGE_KEY);
    if (!raw) {
      return {} as Record<string, TaskPriority>;
    }

    const parsed = JSON.parse(raw) as Record<string, string>;
    const valid: Record<string, TaskPriority> = {};
    for (const [taskId, priority] of Object.entries(parsed)) {
      if (priority === "p1" || priority === "p2" || priority === "p3" || priority === "p4") {
        valid[taskId] = priority;
      }
    }
    return valid;
  } catch {
    return {} as Record<string, TaskPriority>;
  }
}

function writeStoredPriorities(priorities: Record<string, TaskPriority>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PRIORITY_STORAGE_KEY, JSON.stringify(priorities));
}

const statusStyles: Record<TaskStatus, string> = {
  todo: "text-muted-foreground",
  in_progress: "text-primary",
  done: "text-muted-foreground/60 line-through",
};

interface SortableTaskListProps {
  initialTasks?: Task[];
  isLoading?: boolean;
  onReorder?: (tasks: Task[]) => void;
  fill?: boolean;
}

function SortableTaskItem({
  task,
  priority,
  onPriorityChange,
}: {
  task: Task;
  priority: TaskPriority;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-2 rounded-md px-2 py-2.5 transition-colors hover:bg-accent/70 dark:hover:bg-[#3a3a3c]",
        isDragging && "bg-accent shadow-sm",
      )}
    >
      <button
        type="button"
        className="mt-0.5 cursor-grab text-transparent transition-colors group-hover:text-muted-foreground hover:!text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <Circle
        className={cn("mt-0.5 size-4 shrink-0", statusStyles[task.status])}
        strokeWidth={1.75}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={cn("min-w-0 flex-1 text-sm font-medium leading-5", statusStyles[task.status])}>
            {task.title}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            {(Object.keys(priorityLabels) as TaskPriority[]).map((level) => (
              <button
                key={`${task.id}-${level}`}
                type="button"
                onClick={() => onPriorityChange(task.id, level)}
                className={cn(
                  "rounded border px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
                  priority === level
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {priorityLabels[level]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SortableTaskList({
  initialTasks = [],
  isLoading = false,
  onReorder,
  fill = false,
}: SortableTaskListProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [tasksSyncKey, setTasksSyncKey] = useState(() => getTasksSyncKey(initialTasks));
  const [priorities, setPriorities] = useState<Record<string, TaskPriority>>(() =>
    readStoredPriorities(),
  );
  const nextTasksSyncKey = getTasksSyncKey(initialTasks);

  if (nextTasksSyncKey !== tasksSyncKey) {
    setTasksSyncKey(nextTasksSyncKey);
    setTasks(initialTasks);
    setPriorities((current) => {
      const allowed = new Set(initialTasks.map((task) => task.id));
      const next = Object.fromEntries(
        Object.entries(current).filter(([taskId]) => allowed.has(taskId)),
      ) as Record<string, TaskPriority>;
      writeStoredPriorities(next);
      return next;
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setTasks((currentTasks) => {
      const oldIndex = currentTasks.findIndex((task) => task.id === active.id);
      const newIndex = currentTasks.findIndex((task) => task.id === over.id);
      const reordered = arrayMove(currentTasks, oldIndex, newIndex);
      onReorder?.(reordered);
      return reordered;
    });
  }

  function getTaskPriority(task: Task): TaskPriority {
    return priorities[task.id] ?? "p3";
  }

  function handlePriorityChange(taskId: string, nextPriority: TaskPriority) {
    setPriorities((current) => {
      const next = { ...current, [taskId]: nextPriority };
      writeStoredPriorities(next);
      return next;
    });
  }

  const groupedTasks: Record<TaskPriority, Task[]> = {
    p1: [],
    p2: [],
    p3: [],
    p4: [],
  };

  for (const task of tasks) {
    groupedTasks[getTaskPriority(task)].push(task);
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-card dark:bg-[#262626]",
        fill ? "min-h-0 rounded-none border-0" : "rounded-lg border border-border",
      )}
    >
      <div className={cn("border-b border-border px-4 py-2.5", fill && "shrink-0")}>
        <h3 className="text-sm font-semibold">TODO</h3>
      </div>

      <div className={cn("flex-1 overflow-y-auto p-2", fill && "min-h-0")}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {isLoading ? (
                <p className="px-2 py-6 text-sm text-muted-foreground">
                  Loading tasks...
                </p>
              ) : tasks.length === 0 ? (
                <div className="px-2 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No tasks yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    Your to-dos will appear here
                  </p>
                </div>
              ) : (
                (Object.keys(prioritySectionLabels) as TaskPriority[]).map((priorityKey) => (
                  <section key={priorityKey} className="rounded-md border border-border/60">
                    <div className="border-b border-border/60 px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
                      {prioritySectionLabels[priorityKey]}
                    </div>
                    <div className="py-1">
                      {groupedTasks[priorityKey].length === 0 ? (
                        <p className="px-2 py-2 text-xs text-muted-foreground/80">No tasks</p>
                      ) : (
                        groupedTasks[priorityKey].map((task) => (
                          <SortableTaskItem
                            key={task.id}
                            task={task}
                            priority={getTaskPriority(task)}
                            onPriorityChange={handlePriorityChange}
                          />
                        ))
                      )}
                    </div>
                  </section>
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
