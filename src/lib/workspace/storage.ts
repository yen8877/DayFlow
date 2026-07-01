import {
  CALENDAR_FILTERS_DEFAULTS_VERSION,
  defaultCalendarFilterGroups,
  type CalendarFilterGroup,
} from "@/lib/calendar/default-filters";
import {
  defaultDashboardLayout,
  normalizeDashboardLayout,
  type DashboardLayout,
} from "@/lib/dashboard/layout";

const GROUPS_STORAGE_KEY = "dayflow-calendar-filters";
const GROUPS_VERSION_KEY = "dayflow-calendar-filters-version";
const LAYOUT_STORAGE_KEY = "dayflow-dashboard-layout";

const workspaceStorageListeners = new Set<() => void>();

let cachedGroupsSnapshot: CalendarFilterGroup[] = defaultCalendarFilterGroups;
let cachedGroupsRaw: string | null = JSON.stringify(defaultCalendarFilterGroups);

let cachedLayoutSnapshot: DashboardLayout = defaultDashboardLayout;
let cachedLayoutRaw: string | null = JSON.stringify(defaultDashboardLayout);

let hasHydratedWorkspaceStorage = false;

function notifyWorkspaceStorage() {
  workspaceStorageListeners.forEach((listener) => listener());
}

function normalizeGroups(parsed: CalendarFilterGroup[]) {
  return parsed.map((group) => ({
    ...group,
    type:
      group.type ??
      (group.id === "schedules" ? ("schedules" as const) : ("projects" as const)),
    items: group.items.map((item) => ({
      ...item,
      groupId: item.groupId ?? group.id,
    })),
  }));
}

function parseStoredGroups(raw: string | null): CalendarFilterGroup[] {
  if (!raw) {
    return defaultCalendarFilterGroups;
  }

  try {
    const parsed = JSON.parse(raw) as CalendarFilterGroup[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultCalendarFilterGroups;
    }

    return normalizeGroups(parsed);
  } catch {
    return defaultCalendarFilterGroups;
  }
}

function parseStoredLayout(raw: string | null): DashboardLayout {
  if (!raw) {
    return defaultDashboardLayout;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DashboardLayout>;
    return normalizeDashboardLayout(parsed);
  } catch {
    return defaultDashboardLayout;
  }
}

function readStoredGroupsVersion() {
  if (typeof window === "undefined") {
    return CALENDAR_FILTERS_DEFAULTS_VERSION;
  }

  const stored = window.localStorage.getItem(GROUPS_VERSION_KEY);
  const parsed = stored ? Number(stored) : null;

  if (!parsed || Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function resetGroupsToDefaults() {
  if (typeof window === "undefined") {
    return defaultCalendarFilterGroups;
  }

  window.localStorage.removeItem(GROUPS_STORAGE_KEY);
  window.localStorage.setItem(
    GROUPS_VERSION_KEY,
    String(CALENDAR_FILTERS_DEFAULTS_VERSION),
  );
  cachedGroupsRaw = null;
  cachedGroupsSnapshot = defaultCalendarFilterGroups;
  return cachedGroupsSnapshot;
}

function refreshGroupsSnapshotFromStorage() {
  if (typeof window === "undefined") {
    return cachedGroupsSnapshot;
  }

  const storedVersion = readStoredGroupsVersion();
  if (storedVersion !== CALENDAR_FILTERS_DEFAULTS_VERSION) {
    return resetGroupsToDefaults();
  }

  const raw = window.localStorage.getItem(GROUPS_STORAGE_KEY);

  if (raw === cachedGroupsRaw) {
    return cachedGroupsSnapshot;
  }

  cachedGroupsRaw = raw;
  cachedGroupsSnapshot = parseStoredGroups(raw);
  return cachedGroupsSnapshot;
}

function refreshLayoutSnapshotFromStorage() {
  if (typeof window === "undefined") {
    return cachedLayoutSnapshot;
  }

  const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);

  if (raw === cachedLayoutRaw) {
    return cachedLayoutSnapshot;
  }

  cachedLayoutRaw = raw;
  cachedLayoutSnapshot = parseStoredLayout(raw);
  return cachedLayoutSnapshot;
}

export function subscribeWorkspaceStorage(listener: () => void) {
  workspaceStorageListeners.add(listener);
  return () => {
    workspaceStorageListeners.delete(listener);
  };
}

export function getGroupsSnapshot() {
  if (typeof window !== "undefined" && !hasHydratedWorkspaceStorage) {
    return getServerGroupsSnapshot();
  }

  return refreshGroupsSnapshotFromStorage();
}

export function getDashboardLayoutSnapshot() {
  if (typeof window !== "undefined" && !hasHydratedWorkspaceStorage) {
    return getServerDashboardLayoutSnapshot();
  }

  return refreshLayoutSnapshotFromStorage();
}

export function getServerGroupsSnapshot() {
  return defaultCalendarFilterGroups;
}

export function getServerDashboardLayoutSnapshot() {
  return defaultDashboardLayout;
}

export function persistGroups(groups: CalendarFilterGroup[]) {
  if (typeof window === "undefined") {
    return;
  }

  const raw = JSON.stringify(groups);
  window.localStorage.setItem(GROUPS_STORAGE_KEY, raw);
  window.localStorage.setItem(
    GROUPS_VERSION_KEY,
    String(CALENDAR_FILTERS_DEFAULTS_VERSION),
  );
  cachedGroupsRaw = raw;
  cachedGroupsSnapshot = groups;
  notifyWorkspaceStorage();
}

export function persistDashboardLayout(layout: DashboardLayout) {
  if (typeof window === "undefined") {
    return;
  }

  const raw = JSON.stringify(layout);
  window.localStorage.setItem(LAYOUT_STORAGE_KEY, raw);
  cachedLayoutRaw = raw;
  cachedLayoutSnapshot = layout;
  notifyWorkspaceStorage();
}

export function buildCollapsedState(groups: CalendarFilterGroup[]) {
  return Object.fromEntries(groups.map((group) => [group.id, false]));
}

export function hydrateWorkspaceStorage() {
  if (typeof window === "undefined" || hasHydratedWorkspaceStorage) {
    return;
  }

  hasHydratedWorkspaceStorage = true;
  refreshGroupsSnapshotFromStorage();
  refreshLayoutSnapshotFromStorage();
  notifyWorkspaceStorage();
}
