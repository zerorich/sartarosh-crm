import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { deliverExternalChannels } from "../integrations/notification.provider";

export interface NotificationJobData {
  notificationId: string;
}

function asRecord(data: Prisma.JsonValue | null): Record<string, unknown> {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return { ...(data as Record<string, unknown>) };
  }
  return {};
}

export async function processNotificationJob(data: NotificationJobData) {
  const notificationId = data.notificationId;
  if (!notificationId) {
    return { skipped: true, reason: "missing-id" };
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    console.warn("notification job: record not found", notificationId);
    return { skipped: true, reason: "not-found" };
  }

  const existing = asRecord(notification.data);
  if (typeof existing.processedAt === "string") {
    return { skipped: true, reason: "already-processed", notificationId };
  }

  const channels = await deliverExternalChannels({
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
  });

  const processedAt = new Date().toISOString();
  await prisma.notification.update({
    where: { id: notification.id },
    data: {
      data: {
        ...existing,
        processedAt,
        channels,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  return { processed: true, notificationId, channels };
}
