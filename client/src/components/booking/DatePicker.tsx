"use client";

import { cn, toDateKey } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (dateKey: string) => void;
  days?: number;
}

const WEEKDAYS = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];
const MONTHS = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek",
];

export function DatePicker({ value, onChange, days = 14 }: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const options = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="radiogroup" aria-label="Sanani tanlang">
      {options.map((date) => {
        const key = toDateKey(date);
        const active = key === value;
        return (
          <button
            key={key}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(key)}
            className={cn(
              "flex shrink-0 flex-col items-center rounded-xl border px-3.5 py-2 text-center transition-colors cursor-pointer",
              active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-surface-muted",
            )}
          >
            <span className="text-[11px] opacity-70">{WEEKDAYS[date.getDay()]}</span>
            <span className="text-base font-semibold leading-tight">{date.getDate()}</span>
            <span className="text-[11px] opacity-70">{MONTHS[date.getMonth()]}</span>
          </button>
        );
      })}
    </div>
  );
}
