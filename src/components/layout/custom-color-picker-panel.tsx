"use client";

import { useCallback, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomColorPickerPanelProps {
  value: string;
  onChange: (color: string) => void;
  onSave: (color: string) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(hex: string) {
  const withHash = hex.startsWith("#") ? hex : `#${hex}`;
  if (!/^#[0-9a-fA-F]{6}$/.test(withHash)) {
    return null;
  }

  return withHash.toLowerCase();
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function rgbToHsv(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) {
      h = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
  }

  h = Math.round(h * 60);
  if (h < 0) {
    h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s: s * 100, v: v * 100 };
}

function hsvToRgb(h: number, s: number, v: number) {
  const sn = clamp(s, 0, 100) / 100;
  const vn = clamp(v, 0, 100) / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vn - c;

  let rp = 0;
  let gp = 0;
  let bp = 0;

  if (h < 60) {
    rp = c;
    gp = x;
  } else if (h < 120) {
    rp = x;
    gp = c;
  } else if (h < 180) {
    gp = c;
    bp = x;
  } else if (h < 240) {
    gp = x;
    bp = c;
  } else if (h < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }

  return {
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  };
}

function hexToHsv(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsv(r, g, b);
}

function hsvToHex(h: number, s: number, v: number) {
  const { r, g, b } = hsvToRgb(h, s, v);
  return rgbToHex(r, g, b);
}

export function CustomColorPickerPanel({ value, onChange, onSave }: CustomColorPickerPanelProps) {
  const initial = hexToHsv(value);
  const [hue, setHue] = useState(initial.h);
  const [saturation, setSaturation] = useState(initial.s);
  const [brightness, setBrightness] = useState(initial.v);
  const [hexInput, setHexInput] = useState(value);
  const slRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const applyHsv = useCallback(
    (nextHue: number, nextSaturation: number, nextBrightness: number) => {
      const nextHex = hsvToHex(nextHue, nextSaturation, nextBrightness);
      setHue(nextHue);
      setSaturation(nextSaturation);
      setBrightness(nextBrightness);
      setHexInput(nextHex);
      onChange(nextHex);
    },
    [onChange],
  );

  function updateFromSl(clientX: number, clientY: number) {
    const rect = slRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((clientY - rect.top) / rect.height, 0, 1);

    applyHsv(hue, x * 100, (1 - y) * 100);
  }

  function updateFromHue(clientX: number) {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const x = clamp((clientX - rect.left) / rect.width, 0, 1);
    applyHsv(x * 360, saturation, brightness);
  }

  function startSlDrag(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    updateFromSl(event.clientX, event.clientY);

    function onMouseMove(moveEvent: MouseEvent) {
      updateFromSl(moveEvent.clientX, moveEvent.clientY);
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function startHueDrag(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    updateFromHue(event.clientX);

    function onMouseMove(moveEvent: MouseEvent) {
      updateFromHue(moveEvent.clientX);
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function handleHexBlur() {
    const normalized = normalizeHex(hexInput);
    if (!normalized) {
      setHexInput(value);
      return;
    }

    const next = hexToHsv(normalized);
    applyHsv(next.h, next.s, next.v);
  }

  function handleSave() {
    const normalized = normalizeHex(hexInput) ?? normalizeHex(previewColor);
    if (!normalized) {
      return;
    }

    const next = hexToHsv(normalized);
    applyHsv(next.h, next.s, next.v);
    onSave(normalized);
  }

  const slThumbLeft = `${saturation}%`;
  const slThumbTop = `${100 - brightness}%`;
  const hueThumbLeft = `${(hue / 360) * 100}%`;
  const previewColor = hsvToHex(hue, saturation, brightness);

  return (
    <div className="w-52 rounded-lg border border-border bg-popover p-3 shadow-lg dark:bg-[#2d2d30]">
      <div
        ref={slRef}
        role="presentation"
        onMouseDown={startSlDrag}
        className="relative h-32 cursor-crosshair overflow-hidden rounded-md"
        style={{ backgroundColor: `hsl(${hue} 100% 50%)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        <span
          className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: slThumbLeft, top: slThumbTop, backgroundColor: previewColor }}
        />
      </div>

      <div
        ref={hueRef}
        role="presentation"
        onMouseDown={startHueDrag}
        className="relative mt-3 h-3 cursor-pointer rounded-full"
        style={{
          background:
            "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
        }}
      >
        <span
          className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: hueThumbLeft, backgroundColor: `hsl(${hue} 100% 50%)` }}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className="size-8 shrink-0 rounded-md border border-border"
          style={{ backgroundColor: hexInput }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={(event) => setHexInput(event.target.value)}
          onBlur={handleHexBlur}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          className={cn(
            "h-8 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-xs uppercase outline-none",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-[#1e1e1e]",
          )}
        />
      </div>

      <Button type="button" size="sm" className="mt-3 w-full" onClick={handleSave}>
        저장
      </Button>
    </div>
  );
}
