import React from "react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { BookingStatus } from "../model/types";

export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return <StatusBadge type="booking" value={status} className={className} />;
}
