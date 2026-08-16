import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export function ReviewStars({
  rating,
  max = 5,
  size = "sm",
  className,
}: {
  rating: number;
  max?: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
  };

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < Math.floor(rating);
        return (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              isFilled ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-700"
            )}
          />
        );
      })}
    </div>
  );
}
