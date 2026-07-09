"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { SidebarFilterItem } from "@/components/layout/sidebar-filter-item";
import {
  UNGROUPED_GROUP_ID,
  UNGROUPED_GROUP_LABEL,
  type CalendarFilter,
  type CalendarFilterGroup,
} from "@/lib/calendar/default-filters";
import { useWorkspaceEdit } from "@/providers/workspace-edit-provider";
import { cn } from "@/lib/utils";

type DragKind = "group" | "filter" | null;

type DragItem =
  | { kind: "group"; group: CalendarFilterGroup }
  | { kind: "filter"; filter: CalendarFilter };

type GroupInsertionTarget = {
  insertIndex: number;
  lineY: number;
};

const UNGROUPED_DROP_ID = "__ungrouped_drop__";

function getDragPointerY(event: DragOverEvent | DragEndEvent): number | null {
  const activator = event.activatorEvent;
  if (activator instanceof MouseEvent) {
    return activator.clientY + event.delta.y;
  }

  if (activator instanceof TouchEvent && activator.touches[0]) {
    return activator.touches[0].clientY + event.delta.y;
  }

  const translated = event.active.rect.current.translated ?? event.active.rect.current.initial;
  if (!translated) {
    return null;
  }

  return translated.top + translated.height / 2;
}

function SortableGroupSection({
  group,
  dragKind,
  onUpdateLabel,
  onDelete,
  onAddFilter,
  registerGroupElement,
  children,
}: {
  group: CalendarFilterGroup;
  dragKind: DragKind;
  onUpdateLabel: (label: string) => void;
  onDelete: () => void;
  onAddFilter: () => void;
  registerGroupElement: (groupId: string, node: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: group.id,
    data: { kind: "group" },
    disabled: dragKind === "filter",
    animateLayoutChanges: () => false,
  });

  const ref = useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
      registerGroupElement(group.id, node);
    },
    [group.id, registerGroupElement, setNodeRef],
  );

  const isGroupDragActive = dragKind === "group";

  return (
    <section
      ref={ref}
      style={{
        transform:
          isGroupDragActive || isDragging ? undefined : CSS.Translate.toString(transform),
        transition: isGroupDragActive ? undefined : transition,
      }}
      className={cn(
        "mb-3 w-full rounded-lg border border-dashed border-primary/30 bg-primary/5 p-2 last:mb-0",
        isDragging && "pointer-events-none m-0 h-0 overflow-hidden border-0 p-0 opacity-0",
      )}
    >
      <div
        className="mb-2 flex cursor-grab items-center gap-1 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          defaultValue={group.label}
          onPointerDown={(event) => event.stopPropagation()}
          onBlur={(event) => onUpdateLabel(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          className="min-w-0 flex-1 cursor-text rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-[#1e1e1e]"
        />
        <button
          type="button"
          aria-label="Delete group"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onDelete}
          className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-[#c41e3a]"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div
        className={cn("space-y-0.5", isGroupDragActive && "pointer-events-none opacity-60")}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={onAddFilter}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border px-2 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
      >
        <Plus className="size-3" />
        라벨 추가
      </button>
    </section>
  );
}

function SortableFilterRow({
  filter,
  dragKind,
  onToggleVisibility,
  onColorChange,
  onLabelChange,
  onDelete,
}: {
  filter: CalendarFilter;
  dragKind: DragKind;
  onToggleVisibility: (filterId: string) => void;
  onColorChange: (filterId: string, color: string) => void;
  onLabelChange: (filterId: string, label: string) => void;
  onDelete: (filterId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: filter.id,
    data: { kind: "filter" },
    disabled: dragKind === "group",
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn("flex w-full items-center gap-1", isDragging && "opacity-40")}
    >
      <button
        type="button"
        className="cursor-grab rounded p-0.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <div className="min-w-0 flex-1">
        <SidebarFilterItem
          filter={filter}
          onToggleVisibility={onToggleVisibility}
          onColorChange={onColorChange}
          onLabelChange={onLabelChange}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

function GroupDragPreview({ group }: { group: CalendarFilterGroup }) {
  return (
    <div className="w-52 rounded-lg border border-dashed border-primary/40 bg-primary/10 p-2 shadow-lg">
      <p className="px-2 text-[11px] font-medium text-foreground">{group.label}</p>
      <p className="px-2 pt-1 text-[10px] text-muted-foreground">
        {group.items.length} labels
      </p>
    </div>
  );
}

function FilterDragPreview({ filter }: { filter: CalendarFilter }) {
  return (
    <div className="w-52 rounded-md border border-border bg-popover px-2 py-1.5 shadow-lg dark:bg-[#2d2d30]">
      <div className="flex items-center gap-2">
        <span
          className="size-3.5 rounded-[3px]"
          style={{ backgroundColor: filter.color }}
        />
        <span className="truncate text-[13px]">{filter.label}</span>
      </div>
    </div>
  );
}

function UngroupedDropArea({ hasActiveOver }: { hasActiveOver: boolean }) {
  const { setNodeRef } = useDroppable({ id: UNGROUPED_DROP_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "mt-3 rounded-lg border border-dashed px-2 py-2 text-center text-[11px] text-muted-foreground",
        hasActiveOver
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background/40",
      )}
    >
      그룹 밖으로 이동 (기타)
    </div>
  );
}

function findGroupInsertionTarget(
  groups: CalendarFilterGroup[],
  groupElements: Map<string, HTMLElement>,
  activeId: string,
  pointerY: number,
): GroupInsertionTarget | null {
  const activeIndex = groups.findIndex((group) => group.id === activeId);
  const staticGroups = groups.filter((group) => group.id !== activeId);
  if (staticGroups.length === 0) {
    return null;
  }

  const firstElement = groupElements.get(staticGroups[0].id);
  if (!firstElement) {
    return null;
  }

  const firstRect = firstElement.getBoundingClientRect();

  if (activeIndex > 0 && pointerY <= firstRect.top + 12) {
    return { insertIndex: 0, lineY: firstRect.top - 4 };
  }

  const breakpoints: GroupInsertionTarget[] = [
    { insertIndex: 0, lineY: firstRect.top - 4 },
  ];

  staticGroups.forEach((group, index) => {
    const element = groupElements.get(group.id);
    if (!element) {
      return;
    }

    const { bottom } = element.getBoundingClientRect();

    if (index === staticGroups.length - 1) {
      breakpoints.push({ insertIndex: index + 1, lineY: bottom });
      return;
    }

    const nextElement = groupElements.get(staticGroups[index + 1].id);
    if (!nextElement) {
      return;
    }

    const nextTop = nextElement.getBoundingClientRect().top;
    breakpoints.push({ insertIndex: index + 1, lineY: (bottom + nextTop) / 2 });
  });

  return breakpoints.reduce((closest, breakpoint) => {
    const breakpointDistance = Math.abs(pointerY - breakpoint.lineY);
    const closestDistance = Math.abs(pointerY - closest.lineY);
    return breakpointDistance < closestDistance ? breakpoint : closest;
  });
}

export function SidebarEditPanel() {
  const {
    draftGroups,
    updateGroupLabel,
    deleteGroup,
    addGroup,
    addFilter,
    reorderGroups,
    moveFilter,
    setDraftGroups,
  } = useWorkspaceEdit();

  const scrollRef = useRef<HTMLDivElement>(null);
  const groupElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  const [dragKind, setDragKind] = useState<DragKind>(null);
  const [activeDrag, setActiveDrag] = useState<DragItem | null>(null);
  const [groupInsertionTarget, setGroupInsertionTarget] =
    useState<GroupInsertionTarget | null>(null);
  const [dropLineOffset, setDropLineOffset] = useState<number | null>(null);

  const groupIds = draftGroups.map((group) => group.id);

  const registerGroupElement = useCallback((groupId: string, node: HTMLElement | null) => {
    if (node) {
      groupElementsRef.current.set(groupId, node);
      return;
    }

    groupElementsRef.current.delete(groupId);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const collisionDetection = useCallback<CollisionDetection>(
    (args) => {
      if (dragKind === "group") {
        const groupContainers = args.droppableContainers.filter((container) =>
          groupIds.includes(String(container.id)),
        );

        return closestCenter({
          ...args,
          droppableContainers: groupContainers,
        });
      }

      return closestCenter(args);
    },
    [dragKind, groupIds],
  );

  function updateGroupDropIndicator(activeId: string, pointerY: number) {
    const target = findGroupInsertionTarget(
      draftGroups,
      groupElementsRef.current,
      activeId,
      pointerY,
    );

    if (!target) {
      setGroupInsertionTarget(null);
      setDropLineOffset(null);
      return;
    }

    setGroupInsertionTarget(target);

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) {
      return;
    }

    const containerRect = scrollContainer.getBoundingClientRect();
    setDropLineOffset(target.lineY - containerRect.top + scrollContainer.scrollTop);
  }

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    const group = draftGroups.find((item) => item.id === activeId);

    if (group) {
      setDragKind("group");
      setActiveDrag({ kind: "group", group });
      return;
    }

    for (const draftGroup of draftGroups) {
      const filter = draftGroup.items.find((item) => item.id === activeId);
      if (filter) {
        setDragKind("filter");
        setActiveDrag({ kind: "filter", filter });
        return;
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const activeId = String(event.active.id);
    if (!groupIds.includes(activeId)) {
      setGroupInsertionTarget(null);
      setDropLineOffset(null);
      return;
    }

    const pointerY = getDragPointerY(event);
    if (pointerY === null) {
      return;
    }

    updateGroupDropIndicator(activeId, pointerY);
  }

  function handleDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const isGroupDrag = groupIds.includes(activeId);
    const currentInsertionTarget = groupInsertionTarget;

    setDragKind(null);
    setActiveDrag(null);
    setGroupInsertionTarget(null);
    setDropLineOffset(null);

    if (isGroupDrag) {
      const insertionTarget =
        currentInsertionTarget ??
        (() => {
          const pointerY = getDragPointerY(event);
          if (pointerY === null) {
            return null;
          }

          return findGroupInsertionTarget(
            draftGroups,
            groupElementsRef.current,
            activeId,
            pointerY,
          );
        })();

      if (insertionTarget) {
        reorderGroups(activeId, insertionTarget.insertIndex);
      }
      return;
    }

    const { over } = event;
    if (!over || activeId === String(over.id)) {
      return;
    }

    moveFilter(activeId, String(over.id));
  }

  function handleDragCancel() {
    setDragKind(null);
    setActiveDrag(null);
    setGroupInsertionTarget(null);
    setDropLineOffset(null);
  }

  function handleToggleVisibility(filterId: string) {
    setDraftGroups(
      draftGroups.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === filterId ? { ...item, visible: !item.visible } : item,
        ),
      })),
    );
  }

  function handleColorChange(filterId: string, color: string) {
    setDraftGroups(
      draftGroups.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === filterId ? { ...item, color } : item,
        ),
      })),
    );
  }

  function handleLabelChange(filterId: string, label: string) {
    const trimmed = label.trim();
    if (!trimmed) {
      return;
    }

    setDraftGroups(
      draftGroups.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === filterId ? { ...item, label: trimmed } : item,
        ),
      })),
    );
  }

  function handleDeleteFilter(filterId: string) {
    setDraftGroups(
      draftGroups.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.id !== filterId),
      })),
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden px-2 py-2">
      <div className="mb-2 flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => addGroup()}
          className="flex flex-1 items-center justify-center gap-1 rounded-md border border-dashed border-border px-2 py-2 text-[11px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          <Plus className="size-3" />
          그룹 추가
        </button>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-y-auto",
          dragKind === "group" && "pt-1",
        )}
      >
        {dropLineOffset !== null ? (
          <div
            className="pointer-events-none absolute inset-x-1 z-10 h-0.5 rounded-full bg-primary shadow-[0_0_6px_0] shadow-primary/40"
            style={{ top: dropLineOffset }}
            aria-hidden
          />
        ) : null}

        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragStart={handleDragStart}
          onDragMove={handleDragOver}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
            {draftGroups.map((group) => (
              <SortableGroupSection
                key={group.id}
                group={group}
                dragKind={dragKind}
                registerGroupElement={registerGroupElement}
                onUpdateLabel={(label) => updateGroupLabel(group.id, label)}
                onDelete={() => deleteGroup(group.id)}
                onAddFilter={() => addFilter(group.id)}
              >
                <SortableContext
                  items={group.items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {group.items.map((item) => (
                    <SortableFilterRow
                      key={item.id}
                      filter={item}
                      dragKind={dragKind}
                      onToggleVisibility={handleToggleVisibility}
                      onColorChange={handleColorChange}
                      onLabelChange={handleLabelChange}
                      onDelete={handleDeleteFilter}
                    />
                  ))}
                </SortableContext>
              </SortableGroupSection>
            ))}
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeDrag?.kind === "group" ? (
              <GroupDragPreview group={activeDrag.group} />
            ) : null}
            {activeDrag?.kind === "filter" ? (
              <FilterDragPreview filter={activeDrag.filter} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
