import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function BarberRating({
  rating,
  reviewCount,
  showCount = true,
  className,
}: {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center text-amber-500">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
      </div>
      <span className="text-xs font-bold text-slate-900 dark:text-white">
        {rating > 0 ? rating.toFixed(1) : "New"}
      </span>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-slate-400">({reviewCount})</span>
      )}
    </div>
  );
}
