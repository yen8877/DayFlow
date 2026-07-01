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
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/database";

const statusStyles: Record<TaskStatus, string> = {
  todo: "text-muted-foreground",
  in_progress: "text-primary",
  done: "text-muted-foreground/60 line-through",
};

interface SortableTaskListProps {
  initialTasks?: Task[];
  isLoading?: boolean;
  onReorder?: (tasks: Task[]) => void;
}

function SortableTaskItem({ task }: { task: Task }) {
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
        <p className={cn("text-sm font-medium leading-5", statusStyles[task.status])}>
          {task.title}
        </p>
        {task.description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function SortableTaskList({
  initialTasks = [],
  isLoading = false,
  onReorder,
}: SortableTaskListProps) {
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

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

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card dark:bg-[#262626]">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Tasks</h3>
        <p className="text-xs text-muted-foreground">Drag to reorder priorities</p>
      </div>

      <div className="flex-1 p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col">
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
                tasks.map((task) => (
                  <SortableTaskItem key={task.id} task={task} />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
