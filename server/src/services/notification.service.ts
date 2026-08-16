import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { notificationQueue } from "../jobs/queues";

export { notificationQueue };

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data,
    },
  });

  try {
    await notificationQueue.add(
      "send",
      { notificationId: notification.id },
      { removeOnComplete: 100, removeOnFail: 50 },
    );
  } catch (error) {
    console.warn("Failed to enqueue notification send", notification.id, error);
  }

  return notification;
}

export async function listNotifications(userId: string, page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { items, page, limit, total };
}

export async function markRead(userId: string, id: string) {
  return prisma.notification.update({
    where: { id, userId },
    data: { isRead: true, readAt: new Date() },
  });
}
