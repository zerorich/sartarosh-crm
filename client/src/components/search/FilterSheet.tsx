"use client";

import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface SalonFilters {
  radius: number;
  minRating: number | null;
  sort: "nearest" | "rating";
}

const RADIUS_OPTIONS = [1, 3, 5, 10];
const RATING_OPTIONS = [4, 4.5];

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: SalonFilters;
  onApply: (filters: SalonFilters) => void;
}

export function FilterSheet({ open, onClose, filters, onApply }: FilterSheetProps) {
  function update(patch: Partial<SalonFilters>) {
    onApply({ ...filters, ...patch });
  }

  return (
    <Sheet open={open} onClose={onClose} title="Qidiruv va filtrlar">
      <div className="flex flex-col gap-5 p-4">
        <div>
          <p className="mb-2 text-sm font-semibold">Masofa</p>
          <div className="flex flex-wrap gap-2">
            {RADIUS_OPTIONS.map((km) => (
              <FilterChip key={km} active={filters.radius === km} onClick={() => update({ radius: km })}>
                {km} km
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Reyting</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={filters.minRating === null} onClick={() => update({ minRating: null })}>
              Barchasi
            </FilterChip>
            {RATING_OPTIONS.map((r) => (
              <FilterChip key={r} active={filters.minRating === r} onClick={() => update({ minRating: r })}>
                {r}+
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Saralash</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={filters.sort === "nearest"} onClick={() => update({ sort: "nearest" })}>
              Eng yaqin
            </FilterChip>
            <FilterChip active={filters.sort === "rating"} onClick={() => update({ sort: "rating" })}>
              Yuqori baholangan
            </FilterChip>
          </div>
        </div>

        <Button onClick={onClose} fullWidth>
          Qo&apos;llash
        </Button>
      </div>
    </Sheet>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-surface-muted",
      )}
    >
      {children}
    </button>
  );
}
