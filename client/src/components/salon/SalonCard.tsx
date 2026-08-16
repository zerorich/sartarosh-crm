"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Star } from "lucide-react";
import { SalonCover } from "@/components/ui/SalonCover";
import { Button } from "@/components/ui/Button";
import { formatDistance } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Salon } from "@/types/salon";

interface SalonCardProps {
  salon: Salon & { distanceKm?: number };
  startingPrice?: number | null;
  saved?: boolean;
  onToggleSaved?: () => void;
  className?: string;
  /** Horizontal, denser layout for narrow list sidebars (map+list views). */
  compact?: boolean;
}

export function SalonCard({ salon, startingPrice, saved, onToggleSaved, className, compact }: SalonCardProps) {
  const router = useRouter();

  const meta = (
    <>
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <Star className="size-3.5 fill-warning text-warning" aria-hidden />
        <span className="font-medium text-foreground">{salon.rating.toFixed(1)}</span>
        <span>({salon.reviewCount})</span>
        {typeof salon.distanceKm === "number" && (
          <>
            <span aria-hidden>·</span>
            <span>{formatDistance(salon.distanceKm)}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs text-muted">
        <MapPin className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">{salon.city ? `${salon.city}, ${salon.address}` : salon.address}</span>
      </div>
      {typeof startingPrice === "number" && startingPrice > 0 && (
        <p className="mt-0.5 text-xs text-muted">
          <span className="font-semibold text-foreground">{startingPrice.toLocaleString("uz-UZ")} so&apos;m</span>
          dan
        </p>
      )}
    </>
  );

  const savedButton = onToggleSaved && (
    <button
      onClick={(e) => {
        e.preventDefault();
        onToggleSaved();
      }}
      aria-label={saved ? "Saqlanganlardan olib tashlash" : "Saqlash"}
      aria-pressed={saved}
      className="absolute right-2 top-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white"
    >
      <Heart className={cn("size-4", saved && "fill-accent text-accent")} aria-hidden />
    </button>
  );

  const openBadge = salon.status === "ACTIVE" && (
    <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
      Bugun ochiq
    </span>
  );

  if (compact) {
    return (
      <div className={cn("group flex gap-3 overflow-hidden rounded-2xl border border-border bg-surface p-2.5", className)}>
        <Link href={`/salons/${salon.id}`} className="relative block size-24 shrink-0 overflow-hidden rounded-xl">
          <SalonCover name={salon.name} coverUrl={salon.coverUrl} className="h-full w-full" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <Link href={`/salons/${salon.id}`}>
            <h3 className="truncate text-sm font-semibold">{salon.name}</h3>
          </Link>
          {meta}
          <Button size="sm" className="mt-1.5 self-start" onClick={() => router.push(`/salons/${salon.id}/book`)}>
            Bron qilish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <Link href={`/salons/${salon.id}`} className="relative block h-36 w-full">
        <SalonCover name={salon.name} coverUrl={salon.coverUrl} className="h-full w-full" />
        {savedButton}
        {openBadge}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <Link href={`/salons/${salon.id}`}>
          <h3 className="truncate text-sm font-semibold">{salon.name}</h3>
        </Link>
        {meta}
        <Button size="sm" className="mt-2" onClick={() => router.push(`/salons/${salon.id}/book`)}>
          Bron qilish
        </Button>
      </div>
    </div>
  );
}
