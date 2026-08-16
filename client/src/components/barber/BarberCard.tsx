"use client";

import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn, fullName } from "@/lib/utils";
import type { Barber } from "@/types/barber";

interface BarberCardProps {
  barber: Barber;
  selected?: boolean;
  onSelect?: () => void;
}

export function BarberCard({ barber, selected, onSelect }: BarberCardProps) {
  const name = fullName(barber.user) || "Sartarosh";

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-3.5 text-left shadow-sm transition-all active:scale-[0.98]",
        selected ? "border-accent bg-accent/5 shadow-none" : "border-border bg-surface hover:border-foreground/15 hover:shadow-md",
      )}
    >
      <Avatar user={barber.user} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight">{name}</p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <Star className="size-3.5 fill-warning text-warning" aria-hidden />
          <span className="font-medium text-foreground">{barber.rating.toFixed(1)}</span>
          <span>({barber.reviewCount} sharh)</span>
        </div>
        {barber.bio && <p className="mt-0.5 truncate text-xs text-muted">{barber.bio}</p>}
      </div>
    </button>
  );
}
