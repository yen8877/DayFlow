"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { EventInput } from "@fullcalendar/core";

interface CalendarViewProps {
  events?: EventInput[];
  onEventDrop?: (eventId: string, start: Date, end: Date | null) => void;
}

export function CalendarView({ events = [], onEventDrop }: CalendarViewProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card dark:bg-[#262626]">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">Schedule</h3>
        <p className="text-xs text-muted-foreground">Week view with time blocks</p>
      </div>

      <div className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          editable
          selectable
          events={events}
          eventDrop={(info) => {
            onEventDrop?.(
              info.event.id,
              info.event.start!,
              info.event.end ?? null,
            );
          }}
          height="auto"
        />
      </div>
    </div>
  );
}
