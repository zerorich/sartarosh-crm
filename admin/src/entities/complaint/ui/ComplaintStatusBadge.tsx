import React from "react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { ComplaintStatus } from "../model/types";

export function ComplaintStatusBadge({ status, className }: { status: ComplaintStatus; className?: string }) {
  return <StatusBadge type="complaint" value={status} className={className} />;
}
