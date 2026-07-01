"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CalendarView } from "@/components/calendar/calendar-view";
import { SortableTaskList } from "@/components/tasks/sortable-task-list";
import {
  clampPanelSplitRatio,
  type DashboardPanelId,
} from "@/lib/dashboard/layout";
import { useCalendarFilters } from "@/providers/calendar-filter-provider";
import { useWorkspaceEdit } from "@/providers/workspace-edit-provider";
import { cn } from "@/lib/utils";
import type { EventInput } from "@fullcalendar/core";
import type { Task } from "@/types/database";

interface DashboardPanelsProps {
  tasks: Task[];
  isLoadingTasks: boolean;
  events: EventInput[];
}

const panelLabels: Record<DashboardPanelId, string> = {
  tasks: "TODO",
  calendar: "Calendar",
};

function SortablePanel({
  id,
  isEditMode,
  children,
}: {
  id: DashboardPanelId;
  isEditMode: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !isEditMode,
  });

  return (
    <section
      ref={setNodeRef}
      id={id}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn(
        "min-w-0",
        !isEditMode && "h-full min-h-0",
        isEditMode && "scroll-mt-20",
        isEditMode &&
          "cursor-grab rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 ring-1 ring-primary/10 active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
      {...(isEditMode ? attributes : {})}
      {...(isEditMode ? listeners : {})}
    >
      {isEditMode ? (
        <div className="flex items-center gap-2 rounded-t-lg bg-primary/10 px-2 py-1.5 text-[11px] font-medium text-primary">
          <GripVertical className="size-3.5 shrink-0" />
          {panelLabels[id]}
        </div>
      ) : null}
      <div
        className={cn(isEditMode ? "p-2 pt-2" : "h-full min-h-0")}
        onPointerDown={(event) => {
          if (isEditMode) {
            event.stopPropagation();
          }
        }}
      >
        {children}
      </div>
    </section>
  );
}

function PanelDragPreview({ id }: { id: DashboardPanelId }) {
  return (
    <div className="w-full max-w-md rounded-lg border border-dashed border-primary/40 bg-primary/10 px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2 text-[11px] font-medium text-primary">
        <GripVertical className="size-3.5" />
        {panelLabels[id]}
      </div>
    </div>
  );
}

function PanelResizeHandle({ onResizeStart }: { onResizeStart: (event: React.MouseEvent) => void }) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panels"
      className="relative z-10 w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-sidebar-border/80"
      onMouseDown={onResizeStart}
    />
  );
}

function ResizablePanelLayout({
  panelOrder,
  splitRatio,
  onSplitRatioChange,
  panelContent,
}: {
  panelOrder: DashboardPanelId[];
  splitRatio: number;
  onSplitRatioChange: (splitRatio: number) => void;
  panelContent: Record<DashboardPanelId, React.ReactNode>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localSplitRatio, setLocalSplitRatio] = useState(splitRatio);

  useEffect(() => {
    setLocalSplitRatio(splitRatio);
  }, [splitRatio]);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      const container = containerRef.current;
      if (!container) {
        return;
      }

      const startX = event.clientX;
      const startRatio = localSplitRatio;
      const containerWidth = container.getBoundingClientRect().width;
      let latestRatio = startRatio;

      function onMouseMove(moveEvent: MouseEvent) {
        const deltaRatio = (moveEvent.clientX - startX) / containerWidth;
        latestRatio = clampPanelSplitRatio(startRatio + deltaRatio);
        setLocalSplitRatio(latestRatio);
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        onSplitRatioChange(latestRatio);
      }

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [localSplitRatio, onSplitRatioChange],
  );

  if (panelOrder.length < 2) {
    return (
      <div ref={containerRef} className="h-full min-h-0 w-full">
        <div className="h-full min-h-0">{panelContent[panelOrder[0]]}</div>
      </div>
    );
  }

  const [firstPanelId, secondPanelId] = panelOrder;
  const firstPanelWidth = `${localSplitRatio * 100}%`;

  return (
    <div ref={containerRef} className="flex h-full min-h-0 w-full overflow-hidden">
      <div className="h-full min-h-0 shrink-0 overflow-hidden" style={{ width: firstPanelWidth }}>
        {panelContent[firstPanelId]}
      </div>
      <PanelResizeHandle onResizeStart={handleResizeStart} />
      <div className="h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        {panelContent[secondPanelId]}
      </div>
    </div>
  );
}

export function DashboardPanels({ tasks, isLoadingTasks, events }: DashboardPanelsProps) {
  const { isEditMode, draftLayout, reorderDashboardPanels } = useWorkspaceEdit();
  const { dashboardLayout, updatePanelSplitRatio } = useCalendarFilters();
  const layout = isEditMode ? draftLayout : dashboardLayout;
  const { panelOrder, splitRatio } = layout;
  const [activePanelId, setActivePanelId] = useState<DashboardPanelId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActivePanelId(event.active.id as DashboardPanelId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActivePanelId(null);

    if (!over || active.id === over.id) {
      return;
    }

    reorderDashboardPanels(String(active.id), String(over.id));
  }

  function handleDragCancel() {
    setActivePanelId(null);
  }

  const panelContent: Record<DashboardPanelId, React.ReactNode> = {
    tasks: <SortableTaskList initialTasks={tasks} isLoading={isLoadingTasks} fill={!isEditMode} />,
    calendar: (
      <CalendarView
        events={events}
        fill={!isEditMode}
        resizeKey={isEditMode ? "edit" : splitRatio}
      />
    ),
  };

  if (!isEditMode) {
    return (
      <ResizablePanelLayout
        panelOrder={panelOrder}
        splitRatio={splitRatio}
        onSplitRatioChange={updatePanelSplitRatio}
        panelContent={panelContent}
      />
    );
  }

  const grid = (
    <div className="grid min-w-0 grid-cols-2 gap-6 overflow-hidden">
      {panelOrder.map((panelId) => (
        <SortablePanel key={panelId} id={panelId} isEditMode={isEditMode}>
          {panelContent[panelId]}
        </SortablePanel>
      ))}
    </div>
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToParentElement]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={panelOrder} strategy={rectSortingStrategy}>
        {grid}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activePanelId ? <PanelDragPreview id={activePanelId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
