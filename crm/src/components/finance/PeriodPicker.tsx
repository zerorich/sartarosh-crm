"use client";

import { cn } from "@/lib/utils";

export type PeriodPreset = "thisMonth" | "lastMonth";

export interface Period {
  periodStart: string;
  periodEnd: string;
}

function monthRange(monthOffset: number): Period {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0, 23, 59, 59, 999);
  return { periodStart: start.toISOString(), periodEnd: end.toISOString() };
}

export function periodForPreset(preset: PeriodPreset): Period {
  return monthRange(preset === "thisMonth" ? 0 : -1);
}

interface PeriodPickerProps {
  value: PeriodPreset;
  onChange: (preset: PeriodPreset) => void;
}

const PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: "thisMonth", label: "Bu oy" },
  { value: "lastMonth", label: "O'tgan oy" },
];

export function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium",
            value === p.value ? "border-primary bg-primary text-primary-foreground" : "border-border",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
