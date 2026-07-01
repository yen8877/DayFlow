"use client";

import { Check, MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { FilterSettingsPopover } from "@/components/layout/filter-settings-popover";
import type { CalendarFilter } from "@/lib/calendar/default-filters";
import { cn } from "@/lib/utils";

interface SidebarFilterItemProps {
  filter: CalendarFilter;
  onToggleVisibility: (filterId: string) => void;
  onColorChange: (filterId: string, color: string) => void;
  onLabelChange: (filterId: string, label: string) => void;
  onDelete: (filterId: string) => void;
}

export function SidebarFilterItem({
  filter,
  onToggleVisibility,
  onColorChange,
  onLabelChange,
  onDelete,
}: SidebarFilterItemProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        menuButtonRef.current?.contains(target)
      ) {
        return;
      }

      setIsMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isMenuOpen]);

  function openMenu() {
    const button = menuButtonRef.current;
    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 6,
      left: Math.max(8, rect.right - 224),
    });
    setIsMenuOpen(true);
  }

  return (
    <>
      <div className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent/70">
        <button
          type="button"
          aria-label={filter.visible ? `Hide ${filter.label}` : `Show ${filter.label}`}
          onClick={() => onToggleVisibility(filter.id)}
          className="flex size-4 shrink-0 items-center justify-center rounded-[3px] border border-transparent transition-colors"
          style={{ backgroundColor: filter.color }}
        >
          {filter.visible ? (
            <Check className="size-2.5 text-white" strokeWidth={3} />
          ) : null}
        </button>

        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[13px]",
            filter.visible ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {filter.label}
        </span>

        <button
          ref={menuButtonRef}
          type="button"
          aria-label={`${filter.label} settings`}
          onClick={openMenu}
          className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-sidebar-accent hover:text-foreground"
        >
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>

      {isMenuOpen
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-50"
              style={{ top: menuPosition.top, left: menuPosition.left }}
            >
              <FilterSettingsPopover
                key={filter.id}
                label={filter.label}
                color={filter.color}
                onSave={(nextLabel, nextColor) => {
                  onLabelChange(filter.id, nextLabel);
                  onColorChange(filter.id, nextColor);
                  setIsMenuOpen(false);
                }}
                onDelete={() => {
                  onDelete(filter.id);
                  setIsMenuOpen(false);
                }}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
