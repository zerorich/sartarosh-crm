import React from "react";
import { Badge } from "./Badge";
import {
  USER_ROLE_CONFIG,
  SALON_STATUS_CONFIG,
  BOOKING_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  COMPLAINT_STATUS_CONFIG,
  BadgeVariant,
} from "@/shared/constants/status";

export interface StatusBadgeProps {
  type: "role" | "salon" | "booking" | "payment" | "complaint" | "userStatus";
  value: string | boolean;
  className?: string;
}

export function StatusBadge({ type, value, className }: StatusBadgeProps) {
  if (type === "userStatus") {
    const isBlocked = Boolean(value);
    return isBlocked ? (
      <Badge variant="danger" dot className={className}>
        Blocked
      </Badge>
    ) : (
      <Badge variant="success" dot className={className}>
        Active
      </Badge>
    );
  }

  const strVal = String(value).toUpperCase();

  let config: { label: string; variant: BadgeVariant } = {
    label: strVal,
    variant: "neutral",
  };

  if (type === "role" && strVal in USER_ROLE_CONFIG) {
    config = USER_ROLE_CONFIG[strVal as keyof typeof USER_ROLE_CONFIG];
  } else if (type === "salon" && strVal in SALON_STATUS_CONFIG) {
    config = SALON_STATUS_CONFIG[strVal as keyof typeof SALON_STATUS_CONFIG];
  } else if (type === "booking" && strVal in BOOKING_STATUS_CONFIG) {
    config = BOOKING_STATUS_CONFIG[strVal as keyof typeof BOOKING_STATUS_CONFIG];
  } else if (type === "payment" && strVal in PAYMENT_STATUS_CONFIG) {
    config = PAYMENT_STATUS_CONFIG[strVal as keyof typeof PAYMENT_STATUS_CONFIG];
  } else if (type === "complaint" && strVal in COMPLAINT_STATUS_CONFIG) {
    config = COMPLAINT_STATUS_CONFIG[strVal as keyof typeof COMPLAINT_STATUS_CONFIG];
  }

  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}
