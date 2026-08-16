import React from "react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { PaymentStatus } from "../model/types";

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return <StatusBadge type="payment" value={status} className={className} />;
}
