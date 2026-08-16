import React from "react";
import { cn, getInitials } from "@/shared/lib/utils";

export interface UserAvatarProps {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  statusDot?: "online" | "offline" | "blocked";
}

export function UserAvatar({
  src,
  firstName,
  lastName,
  size = "md",
  className,
  statusDot,
}: UserAvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base font-bold",
    xl: "w-20 h-20 text-xl font-bold",
  };

  const dotClasses = {
    online: "bg-emerald-500",
    offline: "bg-slate-400",
    blocked: "bg-rose-500",
  };

  const initials = getInitials(firstName, lastName);

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold overflow-hidden border border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-slate-800 to-slate-700 text-white select-none shadow-sm",
          sizeClasses[size],
          className
        )}
      >
        {src && !hasError ? (
          <img
            src={src}
            alt={`${firstName || ""} ${lastName || ""}`}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {statusDot && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-slate-900",
            size === "xs" || size === "sm" ? "w-2 h-2" : "w-3 h-3",
            dotClasses[statusDot]
          )}
        />
      )}
    </div>
  );
}
