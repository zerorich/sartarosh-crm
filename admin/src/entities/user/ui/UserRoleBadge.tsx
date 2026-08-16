import React from "react";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { UserRole } from "../model/types";

export function UserRoleBadge({ role, className }: { role: UserRole; className?: string }) {
  return <StatusBadge type="role" value={role} className={className} />;
}
