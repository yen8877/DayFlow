"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { EventInput } from "@fullcalendar/core";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalendarViewProps {
  events?: EventInput[];
  onEventDrop?: (eventId: string, start: Date, end: Date | null) => void;
}

export function CalendarView({ events = [], onEventDrop }: CalendarViewProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
