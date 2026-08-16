import React from "react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { SalonStatus } from "../model/types";

export function SalonStatusBadge({ status, className }: { status: SalonStatus; className?: string }) {
  return <StatusBadge type="salon" value={status} className={className} />;
}
