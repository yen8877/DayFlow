import { getPalette } from "@/lib/calendar/color-palettes";

export type CalendarFilterGroupType = "projects" | "schedules";
export const UNGROUPED_GROUP_ID = "__ungrouped__";
export const UNGROUPED_GROUP_LABEL = "기타";

export interface CalendarFilter {
  id: string;
  groupId: string;
  filterType?: CalendarFilterGroupType;
  label: string;
  color: string;
  visible: boolean;
}

export interface CalendarFilterGroup {
  id: string;
  type: CalendarFilterGroupType;
  label: string;
  items: CalendarFilter[];
}

const defaultColors = getPalette("default").colors;

/** Bump when you change defaults and want them to replace saved sidebar filters. */
export const CALENDAR_FILTERS_DEFAULTS_VERSION = 2;

export const defaultCalendarFilterGroups: CalendarFilterGroup[] = [
  {
    id: "projects",
    type: "projects",
    label: "스프린트",
    items: [
      {
        id: "proj-work",
        groupId: "projects",
        label: "업무",
        color: defaultColors[12],
        visible: true,
      },
      {
        id: "proj-personal",
        groupId: "projects",
        label: "개인",
        color: defaultColors[8],
        visible: true,
      },
    ],
  },
  {
    id: "schedules",
    type: "schedules",
    label: "일정",
    items: [
      {
        id: "sched-default",
        groupId: "schedules",
        label: "default",
        color: defaultColors[10],
        visible: true,
      },
      {
        id: "sched-meeting",
        groupId: "schedules",
        label: "미팅",
        color: defaultColors[15],
        visible: true,
      },
    ],
  },
];

export function flattenFilters(groups: CalendarFilterGroup[]) {
  return groups.flatMap((group) => group.items);
}

export function createGroupId() {
  return `group-${crypto.randomUUID()}`;
}

export function createFilterId() {
  return `filter-${crypto.randomUUID()}`;
}
