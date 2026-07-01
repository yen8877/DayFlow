"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createFilterId,
  createGroupId,
  flattenFilters,
  type CalendarFilter,
  type CalendarFilterGroup,
  type CalendarFilterGroupType,
} from "@/lib/calendar/default-filters";
import { getPalette } from "@/lib/calendar/color-palettes";
import {
  type DashboardLayout,
  type DashboardPanelId,
} from "@/lib/dashboard/layout";
import { arrayMove } from "@dnd-kit/sortable";

interface WorkspaceEditContextValue {
  isEditMode: boolean;
  draftGroups: CalendarFilterGroup[];
  draftLayout: DashboardLayout;
  enterEditMode: () => void;
  cancelEditMode: () => void;
  saveEditMode: () => void;
  setDraftGroups: (groups: CalendarFilterGroup[]) => void;
  setDraftLayout: (layout: DashboardLayout) => void;
  updateGroupLabel: (groupId: string, label: string) => void;
  deleteGroup: (groupId: string) => void;
  addGroup: (type?: CalendarFilterGroupType) => void;
  addFilter: (groupId: string) => void;
  reorderGroups: (activeId: string, insertIndex: number) => void;
  moveFilter: (filterId: string, overId: string) => void;
  reorderDashboardPanels: (activeId: string, overId: string) => void;
}

const WorkspaceEditContext = createContext<WorkspaceEditContextValue | null>(null);

function cloneGroups(groups: CalendarFilterGroup[]) {
  return structuredClone(groups);
}

function cloneLayout(layout: DashboardLayout) {
  return structuredClone(layout);
}

interface WorkspaceEditProviderProps {
  children: ReactNode;
  groups: CalendarFilterGroup[];
  dashboardLayout: DashboardLayout;
  onSave: (groups: CalendarFilterGroup[], layout: DashboardLayout) => void;
}

export function WorkspaceEditProvider({
  children,
  groups,
  dashboardLayout,
  onSave,
}: WorkspaceEditProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftGroups, setDraftGroups] = useState<CalendarFilterGroup[]>(groups);
  const [draftLayout, setDraftLayout] = useState<DashboardLayout>(dashboardLayout);

  const enterEditMode = useCallback(() => {
    setDraftGroups(cloneGroups(groups));
    setDraftLayout(cloneLayout(dashboardLayout));
    setIsEditMode(true);
  }, [dashboardLayout, groups]);

  const cancelEditMode = useCallback(() => {
    setDraftGroups(cloneGroups(groups));
    setDraftLayout(cloneLayout(dashboardLayout));
    setIsEditMode(false);
  }, [dashboardLayout, groups]);

  const saveEditMode = useCallback(() => {
    onSave(cloneGroups(draftGroups), cloneLayout(draftLayout));
    setIsEditMode(false);
  }, [draftGroups, draftLayout, onSave]);

  const updateGroupLabel = useCallback((groupId: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) {
      return;
    }

    setDraftGroups((current) =>
      current.map((group) =>
        group.id === groupId ? { ...group, label: trimmed } : group,
      ),
    );
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    setDraftGroups((current) => current.filter((group) => group.id !== groupId));
  }, []);

  const addGroup = useCallback((type: CalendarFilterGroupType = "projects") => {
    const id = createGroupId();
    const nextGroup: CalendarFilterGroup = {
      id,
      type,
      label: type === "projects" ? "새 스프린트 그룹" : "새 일정 그룹",
      items: [],
    };

    setDraftGroups((current) => [...current, nextGroup]);
  }, []);

  const addFilter = useCallback((groupId: string) => {
    const defaultColor = getPalette("default").colors[0];
    const filterId = createFilterId();

    setDraftGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              items: [
                ...group.items,
                {
                  id: filterId,
                  groupId,
                  label: "새 라벨",
                  color: defaultColor,
                  visible: true,
                },
              ],
            }
          : group,
      ),
    );
  }, []);

  const reorderGroups = useCallback((activeId: string, insertIndex: number) => {
    setDraftGroups((current) => {
      const oldIndex = current.findIndex((group) => group.id === activeId);
      if (oldIndex < 0) {
        return current;
      }

      const moving = current[oldIndex];
      const rest = current.filter((group) => group.id !== activeId);
      const nextIndex = Math.max(0, Math.min(insertIndex, rest.length));

      const next = [...rest];
      next.splice(nextIndex, 0, moving);

      const unchanged =
        next.length === current.length &&
        next.every((group, index) => group.id === current[index]?.id);

      if (unchanged) {
        return current;
      }

      return next;
    });
  }, []);

  const moveFilter = useCallback((filterId: string, overId: string) => {
    setDraftGroups((current) => {
      const sourceGroupIndex = current.findIndex((group) =>
        group.items.some((item) => item.id === filterId),
      );
      if (sourceGroupIndex < 0) {
        return current;
      }

      const sourceGroup = current[sourceGroupIndex];
      const filterIndex = sourceGroup.items.findIndex((item) => item.id === filterId);
      const filter = sourceGroup.items[filterIndex];
      if (!filter) {
        return current;
      }

      const targetGroupIndex = current.findIndex(
        (group) => group.id === overId || group.items.some((item) => item.id === overId),
      );
      if (targetGroupIndex < 0) {
        return current;
      }

      const targetGroup = current[targetGroupIndex];
      const isOverGroup = targetGroup.id === overId;

      if (sourceGroupIndex === targetGroupIndex && !isOverGroup) {
        const oldIndex = sourceGroup.items.findIndex((item) => item.id === filterId);
        const newIndex = sourceGroup.items.findIndex((item) => item.id === overId);

        if (oldIndex < 0 || newIndex < 0) {
          return current;
        }

        return current.map((group, index) =>
          index === sourceGroupIndex
            ? { ...group, items: arrayMove(group.items, oldIndex, newIndex) }
            : group,
        );
      }

      const targetItemIndex = isOverGroup
        ? targetGroup.items.length
        : targetGroup.items.findIndex((item) => item.id === overId);

      const next = current.map((group) => ({
        ...group,
        items: [...group.items],
      }));

      next[sourceGroupIndex].items = next[sourceGroupIndex].items.filter(
        (item) => item.id !== filterId,
      );

      const movedFilter: CalendarFilter = {
        ...filter,
        groupId: targetGroup.id,
      };

      next[targetGroupIndex].items.splice(targetItemIndex, 0, movedFilter);
      return next;
    });
  }, []);

  const reorderDashboardPanels = useCallback((activeId: string, overId: string) => {
    if (activeId === overId) {
      return;
    }

    setDraftLayout((current) => {
      const oldIndex = current.panelOrder.indexOf(activeId as DashboardPanelId);
      const newIndex = current.panelOrder.indexOf(overId as DashboardPanelId);

      if (oldIndex < 0 || newIndex < 0) {
        return current;
      }

      const nextOrder = [...current.panelOrder];
      const [moved] = nextOrder.splice(oldIndex, 1);
      nextOrder.splice(newIndex, 0, moved);

      return { ...current, panelOrder: nextOrder };
    });
  }, []);

  const value = useMemo(
    () => ({
      isEditMode,
      draftGroups,
      draftLayout,
      enterEditMode,
      cancelEditMode,
      saveEditMode,
      setDraftGroups,
      setDraftLayout,
      updateGroupLabel,
      deleteGroup,
      addGroup,
      addFilter,
      reorderGroups,
      moveFilter,
      reorderDashboardPanels,
    }),
    [
      isEditMode,
      draftGroups,
      draftLayout,
      enterEditMode,
      cancelEditMode,
      saveEditMode,
      updateGroupLabel,
      deleteGroup,
      addGroup,
      addFilter,
      reorderGroups,
      moveFilter,
      reorderDashboardPanels,
    ],
  );

  return (
    <WorkspaceEditContext.Provider value={value}>{children}</WorkspaceEditContext.Provider>
  );
}

export function useWorkspaceEdit() {
  const context = useContext(WorkspaceEditContext);

  if (!context) {
    throw new Error("useWorkspaceEdit must be used within WorkspaceEditProvider");
  }

  return context;
}

export function useVisibleScheduleFilterIds(groups: CalendarFilterGroup[]) {
  return useMemo(
    () =>
      flattenFilters(groups)
        .filter((filter) => {
          const group = groups.find((item) => item.id === filter.groupId);
          return group?.type === "schedules" && filter.visible;
        })
        .map((filter) => filter.id),
    [groups],
  );
}
