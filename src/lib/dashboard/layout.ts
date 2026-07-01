export type DashboardPanelId = "tasks" | "calendar";

export interface DashboardLayout {
  panelOrder: DashboardPanelId[];
  splitRatio: number;
}

export const DEFAULT_PANEL_SPLIT_RATIO = 0.5;
export const MIN_PANEL_SPLIT_RATIO = 0.2;
export const MAX_PANEL_SPLIT_RATIO = 0.8;

export const defaultDashboardLayout: DashboardLayout = {
  panelOrder: ["tasks", "calendar"],
  splitRatio: DEFAULT_PANEL_SPLIT_RATIO,
};

export function clampPanelSplitRatio(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_PANEL_SPLIT_RATIO;
  }

  return Math.min(MAX_PANEL_SPLIT_RATIO, Math.max(MIN_PANEL_SPLIT_RATIO, value));
}

export function normalizeDashboardLayout(layout: Partial<DashboardLayout>): DashboardLayout {
  const panelOrder =
    Array.isArray(layout.panelOrder) &&
    layout.panelOrder.length === 2 &&
    layout.panelOrder.every((panel) => panel === "tasks" || panel === "calendar")
      ? layout.panelOrder
      : defaultDashboardLayout.panelOrder;

  return {
    panelOrder,
    splitRatio: clampPanelSplitRatio(layout.splitRatio),
  };
}

const LAYOUT_STORAGE_KEY = "dayflow-dashboard-layout";

export function loadDashboardLayout(): DashboardLayout {
  if (typeof window === "undefined") {
    return defaultDashboardLayout;
  }

  try {
    const stored = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!stored) {
      return defaultDashboardLayout;
    }

    const parsed = JSON.parse(stored) as Partial<DashboardLayout>;
    return normalizeDashboardLayout(parsed);
  } catch {
    return defaultDashboardLayout;
  }
}

export function persistDashboardLayout(layout: DashboardLayout) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
}
