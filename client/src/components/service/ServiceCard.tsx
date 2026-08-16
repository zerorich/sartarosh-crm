"use client";

import { Clock } from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import type { Service } from "@/types/service";

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onSelect?: () => void;
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 text-left shadow-sm transition-all active:scale-[0.98]",
        selected ? "border-accent bg-accent/5 shadow-none" : "border-border bg-surface hover:border-foreground/15 hover:shadow-md",
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight">{service.name}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted">
          <Clock className="size-3.5" aria-hidden />
          <span>{service.durationMinutes} daqiqa</span>
        </div>
      </div>
      <p className="shrink-0 text-sm font-semibold text-foreground">{formatMoney(service.price)}</p>
    </button>
  );
}
