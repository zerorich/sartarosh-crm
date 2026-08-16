import type { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export async function writeAudit(params: {
  actorId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata,
    },
  });
}
