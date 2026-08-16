"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  label?: string;
}

export function RatingStars({ value, size = 16, interactive = false, onChange, label }: RatingStarsProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-px" role={interactive ? "radiogroup" : undefined} aria-label={label}>
      {stars.map((star) => {
        const filled = star <= Math.round(value);
        if (!interactive) {
          return (
            <Star
              key={star}
              width={size}
              height={size}
              strokeWidth={1.75}
              className={filled ? "fill-warning text-warning" : "fill-transparent text-border"}
              aria-hidden
            />
          );
        }
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} yulduz`}
            onClick={() => onChange?.(star)}
            className="cursor-pointer rounded p-0.5 transition-transform active:scale-90"
          >
            <Star
              width={size}
              height={size}
              strokeWidth={1.75}
              className={cn(filled ? "fill-warning text-warning" : "fill-transparent text-border", "transition-colors")}
            />
          </button>
        );
      })}
    </div>
  );
}
