"use client";

import { MapPinOff } from "lucide-react";
import { SalonCard } from "./SalonCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SalonListSkeleton } from "@/components/ui/Skeleton";
import { useSavedSalons, useToggleSavedSalon } from "@/hooks/queries";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { NearbySalon, Salon } from "@/types/salon";

interface SalonListProps {
  salons: (Salon | NearbySalon)[] | undefined;
  isLoading: boolean;
  error?: unknown;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** "grid": responsive multi-column (full-width sections). "list": always
   * single column — use inside a narrow sidebar, where viewport-based grid
   * breakpoints would otherwise squeeze cards too tight for their container. */
  layout?: "grid" | "list";
}

export function SalonList({
  salons,
  isLoading,
  error,
  onRetry,
  emptyTitle = "Bu hududda hozircha sartaroshxonalar topilmadi.",
  emptyDescription,
  emptyAction,
  layout = "grid",
}: SalonListProps) {
  const { isAuthenticated } = useAuth();
  const { data: saved } = useSavedSalons();
  const toggleSaved = useToggleSavedSalon();
  const savedIds = new Set((saved ?? []).map((s) => s.id));

  if (isLoading) return <SalonListSkeleton layout={layout} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} title="Sartaroshxonalarni yuklab bo'lmadi" />;
  if (!salons || salons.length === 0) {
    return <EmptyState icon={MapPinOff} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className={cn("grid grid-cols-1 gap-4", layout === "grid" && "sm:grid-cols-2 lg:grid-cols-3")}>
      {salons.map((salon) => (
        <SalonCard
          key={salon.id}
          salon={salon}
          compact={layout === "list"}
          saved={savedIds.has(salon.id)}
          onToggleSaved={
            isAuthenticated
              ? () => toggleSaved.mutate({ salonId: salon.id, saved: savedIds.has(salon.id) })
              : undefined
          }
        />
      ))}
    </div>
  );
}
