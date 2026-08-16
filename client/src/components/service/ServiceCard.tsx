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
        "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors",
        selected ? "border-accent bg-accent/5" : "border-border hover:bg-surface-muted",
      )}
    >
      <div>
        <p className="text-sm font-semibold">{service.name}</p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <Clock className="size-3.5" aria-hidden />
          <span>{service.durationMinutes} daqiqa</span>
        </div>
      </div>
      <p className="shrink-0 text-sm font-semibold">{formatMoney(service.price)}</p>
    </button>
  );
}
