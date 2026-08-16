"use client";

import { CalendarX2 } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AvailableSlot } from "@/types/booking";

interface TimeSlotPickerProps {
  slots: AvailableSlot[];
  value: string | null;
  onChange: (startAt: string) => void;
}

export function TimeSlotPicker({ slots, value, onChange }: TimeSlotPickerProps) {
  if (slots.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Bu kunga bo'sh vaqt yo'q"
        description="Boshqa sanani tanlab ko'ring."
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Vaqtni tanlang">
      {slots.map((slot) => {
        const active = slot.startAt === value;
        return (
          <button
            key={slot.startAt}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(slot.startAt)}
            className={cn(
              "cursor-pointer rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors",
              active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-surface-muted",
            )}
          >
            {formatTime(slot.startAt)}
          </button>
        );
      })}
    </div>
  );
}
