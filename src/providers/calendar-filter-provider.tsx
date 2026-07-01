"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  flattenFilters,
  type CalendarFilter,
  type CalendarFilterGroup,
} from "@/lib/calendar/default-filters";
import type { DashboardLayout } from "@/lib/dashboard/layout";
import { clampPanelSplitRatio } from "@/lib/dashboard/layout";
import {
  buildCollapsedState,
  getDashboardLayoutSnapshot,
  getGroupsSnapshot,
  getServerDashboardLayoutSnapshot,
  getServerGroupsSnapshot,
  hydrateWorkspaceStorage,
  persistDashboardLayout,
  persistGroups,
  subscribeWorkspaceStorage,
} from "@/lib/workspace/storage";
import { WorkspaceEditProvider } from "@/providers/workspace-edit-provider";

interface CalendarFilterContextValue {
  groups: CalendarFilterGroup[];
  dashboardLayout: DashboardLayout;
  collapsedGroups: Record<string, boolean>;
  toggleVisibility: (filterId: string) => void;
  updateFilterColor: (filterId: string, color: string) => void;
  updateFilterLabel: (filterId: string, label: string) => void;
  deleteFilter: (filterId: string) => void;
  toggleGroupCollapsed: (groupId: string) => void;
  isFilterVisible: (filterId: string) => boolean;
  getVisibleFilterIdsByType: (type: CalendarFilterGroup["type"]) => string[];
  getFilterById: (filterId: string) => CalendarFilter | undefined;
  replaceWorkspaceState: (groups: CalendarFilterGroup[], layout: DashboardLayout) => void;
  updatePanelSplitRatio: (splitRatio: number) => void;
}

const CalendarFilterContext = createContext<CalendarFilterContextValue | null>(null);

function useStoredGroups() {
  return useSyncExternalStore(
    subscribeWorkspaceStorage,
    getGroupsSnapshot,
    getServerGroupsSnapshot,
  );
}

function useStoredDashboardLayout() {
  return useSyncExternalStore(
    subscribeWorkspaceStorage,
    getDashboardLayoutSnapshot,
    getServerDashboardLayoutSnapshot,
  );
}

export function CalendarFilterProvider({ children }: { children: ReactNode }) {
  const groups = useStoredGroups();
  const dashboardLayout = useStoredDashboardLayout();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    hydrateWorkspaceStorage();
  }, []);

  const mergedCollapsedGroups = useMemo(() => {
    const next: Record<string, boolean> = {};
    for (const group of groups) {
      next[group.id] = collapsedGroups[group.id] ?? false;
    }
    return next;
  }, [collapsedGroups, groups]);

  const allFilters = useMemo(() => flattenFilters(groups), [groups]);

  const updateGroups = useCallback(
    (updater: (current: CalendarFilterGroup[]) => CalendarFilterGroup[]) => {
      persistGroups(updater(getGroupsSnapshot()));
    },
    [],
  );

  const replaceWorkspaceState = useCallback(
    (nextGroups: CalendarFilterGroup[], nextLayout: DashboardLayout) => {
      persistGroups(nextGroups);
      persistDashboardLayout(nextLayout);
      setCollapsedGroups(buildCollapsedState(nextGroups));
    },
    [],
  );

  const updatePanelSplitRatio = useCallback((splitRatio: number) => {
    persistDashboardLayout({
      ...getDashboardLayoutSnapshot(),
      splitRatio: clampPanelSplitRatio(splitRatio),
    });
  }, []);

  const toggleVisibility = useCallback(
    (filterId: string) => {
      updateGroups((current) =>
        current.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.id === filterId ? { ...item, visible: !item.visible } : item,
          ),
        })),
      );
    },
    [updateGroups],
  );

  const updateFilterColor = useCallback(
    (filterId: string, color: string) => {
      updateGroups((current) =>
        current.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.id === filterId ? { ...item, color } : item,
          ),
        })),
      );
    },
    [updateGroups],
  );

  const updateFilterLabel = useCallback(
    (filterId: string, label: string) => {
      const trimmed = label.trim();
      if (!trimmed) {
        return;
      }

      updateGroups((current) =>
        current.map((group) => ({
          ...group,
          items: group.items.map((item) =>
            item.id === filterId ? { ...item, label: trimmed } : item,
          ),
        })),
      );
    },
    [updateGroups],
  );

  const deleteFilter = useCallback(
    (filterId: string) => {
      updateGroups((current) =>
        current.map((group) => ({
          ...group,
          items: group.items.filter((item) => item.id !== filterId),
        })),
      );
    },
    [updateGroups],
  );

  const toggleGroupCollapsed = useCallback((groupId: string) => {
    setCollapsedGroups((current) => ({
      ...current,
      [groupId]: !(current[groupId] ?? false),
    }));
  }, []);

  const isFilterVisible = useCallback(
    (filterId: string) => allFilters.find((filter) => filter.id === filterId)?.visible ?? false,
    [allFilters],
  );

  const getVisibleFilterIdsByType = useCallback(
    (type: CalendarFilterGroup["type"]) =>
      allFilters
        .filter((filter) => {
          const group = groups.find((item) => item.id === filter.groupId);
          return group?.type === type && filter.visible;
        })
        .map((filter) => filter.id),
    [allFilters, groups],
  );

  const getFilterById = useCallback(
    (filterId: string) => allFilters.find((filter) => filter.id === filterId),
    [allFilters],
  );

  const value = useMemo(
    () => ({
      groups,
      dashboardLayout,
      collapsedGroups: mergedCollapsedGroups,
      toggleVisibility,
      updateFilterColor,
      updateFilterLabel,
      deleteFilter,
      toggleGroupCollapsed,
      isFilterVisible,
      getVisibleFilterIdsByType,
      getFilterById,
      replaceWorkspaceState,
      updatePanelSplitRatio,
    }),
    [
      groups,
      dashboardLayout,
      mergedCollapsedGroups,
      toggleVisibility,
      updateFilterColor,
      updateFilterLabel,
      deleteFilter,
      toggleGroupCollapsed,
      isFilterVisible,
      getVisibleFilterIdsByType,
      getFilterById,
      replaceWorkspaceState,
      updatePanelSplitRatio,
    ],
  );

  return (
    <CalendarFilterContext.Provider value={value}>
      <WorkspaceEditProvider
        groups={groups}
        dashboardLayout={dashboardLayout}
        onSave={replaceWorkspaceState}
      >
        {children}
      </WorkspaceEditProvider>
    </CalendarFilterContext.Provider>
  );
}

export function useCalendarFilters() {
  const context = useContext(CalendarFilterContext);

  if (!context) {
    throw new Error("useCalendarFilters must be used within CalendarFilterProvider");
  }

  return context;
}
