"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { EventInput } from "@fullcalendar/core";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface CalendarViewProps {
  events?: EventInput[];
  onEventDrop?: (eventId: string, start: Date, end: Date | null) => void;
  fill?: boolean;
  resizeKey?: string | number;
}

export function CalendarView({
  events = [],
  onEventDrop,
  fill = false,
  resizeKey,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      calendarRef.current?.getApi().updateSize();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [resizeKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver(() => {
      calendarRef.current?.getApi().updateSize();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-card dark:bg-[#262626]",
        fill ? "min-h-0 rounded-none border-0" : "rounded-lg border border-border",
      )}
    >
      <div className={cn("flex min-h-0 flex-1 flex-col", fill ? "overflow-hidden p-3" : "p-4")}>
        <div ref={containerRef} className={cn(fill && "h-full min-h-0")}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next",
              center: "",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            buttonText={{
              month: "month",
              week: "week",
              day: "day",
            }}
            views={{
              dayGridMonth: {
                dayHeaderFormat: { weekday: "short" },
              },
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
            height={fill ? "100%" : "auto"}
          />
        </div>
      </div>
    </div>
  );
}
