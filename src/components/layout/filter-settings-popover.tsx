"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";

import { CustomColorPickerPanel } from "@/components/layout/custom-color-picker-panel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  COLOR_PALETTES,
  type ColorPaletteTheme,
} from "@/lib/calendar/color-palettes";
import { cn } from "@/lib/utils";

interface FilterSettingsPopoverProps {
  label: string;
  color: string;
  onSave: (label: string, color: string) => void;
  onColorPreview?: (color: string) => void;
  onDelete: () => void;
}

function isLightColor(hex: string) {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62;
}

export function FilterSettingsPopover({
  label,
  color,
  onSave,
  onColorPreview,
  onDelete,
}: FilterSettingsPopoverProps) {
  const [activeTheme, setActiveTheme] = useState<ColorPaletteTheme>("default");
  const [draftLabel, setDraftLabel] = useState(label);
  const [draftColor, setDraftColor] = useState(color);
  const [customDefaultColors, setCustomDefaultColors] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCustomPickerOpen, setIsCustomPickerOpen] = useState(false);
  const activePalette = COLOR_PALETTES.find((palette) => palette.theme === activeTheme)!;
  const visibleColors =
    activeTheme === "default"
      ? [...activePalette.colors, ...customDefaultColors]
      : activePalette.colors;

  function handleSave() {
    const trimmed = draftLabel.trim();
    if (!trimmed) {
      return;
    }

    onSave(trimmed, draftColor);
  }

  function handleConfirmDelete() {
    onDelete();
    setIsDeleteDialogOpen(false);
  }

  return (
    <>
      <div className="flex items-start gap-2">
        <div className="w-56 rounded-lg border border-border bg-popover p-3 shadow-lg dark:bg-[#2d2d30]">
          <input
            type="text"
            value={draftLabel}
            onChange={(event) => setDraftLabel(event.target.value)}
            className="mb-3 h-8 w-full rounded-md border border-border bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-[#1e1e1e]"
          />

          <div className="mb-3 flex gap-1">
            {COLOR_PALETTES.map((palette) => (
              <button
                key={palette.theme}
                type="button"
                onClick={() => setActiveTheme(palette.theme)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                  activeTheme === palette.theme
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground",
                )}
              >
                {palette.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-6 gap-2">
            {visibleColors.map((paletteColor) => {
              const isSelected = draftColor.toLowerCase() === paletteColor.toLowerCase();

              return (
                <button
                  key={`${activeTheme}-${paletteColor}`}
                  type="button"
                  aria-label={`Select color ${paletteColor}`}
                  onClick={() => {
                    setDraftColor(paletteColor);
                    onColorPreview?.(paletteColor);
                    setIsCustomPickerOpen(false);
                  }}
                  className="flex size-7 items-center justify-center rounded-full transition-transform hover:scale-105"
                  style={{ backgroundColor: paletteColor }}
                >
                  {isSelected ? (
                    <Check
                      className={cn(
                        "size-3.5",
                        isLightColor(paletteColor) ? "text-foreground" : "text-white",
                      )}
                      strokeWidth={3}
                    />
                  ) : null}
                </button>
              );
            })}

            {activeTheme === "default" ? (
              <button
                type="button"
                aria-label="Custom color"
                aria-pressed={isCustomPickerOpen}
                onClick={() => setIsCustomPickerOpen((open) => !open)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border border-dashed transition-colors",
                  isCustomPickerOpen
                    ? "border-primary bg-sidebar-accent text-foreground"
                    : "border-border text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <Plus className="size-3.5" />
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              삭제
            </Button>
            <Button type="button" size="sm" className="flex-1" onClick={handleSave}>
              저장
            </Button>
          </div>
        </div>

        {isCustomPickerOpen ? (
          <CustomColorPickerPanel
            value={draftColor}
            onChange={setDraftColor}
            onSave={(nextColor) => {
              setDraftColor(nextColor);
              setCustomDefaultColors((current) =>
                current.some((item) => item.toLowerCase() === nextColor.toLowerCase())
                  ? current
                  : [...current, nextColor],
              );
              setIsCustomPickerOpen(false);
            }}
            onCancel={() => setIsCustomPickerOpen(false)}
          />
        ) : null}
      </div>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        message="삭제하시겠습니까?"
        confirmLabel="삭제"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
}
