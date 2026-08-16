import { prisma } from "../config/prisma";
import { createNotification } from "../services/notification.service";
import { getSettings } from "../services/settings.service";

const reminderInclude = {
  salon: { select: { name: true } },
  service: { select: { name: true } },
} as const;

async function sendReminder(
  booking: {
    id: string;
    clientId: string;
    startAt: Date;
    salon: { name: string };
    service: { name: string };
  },
  title: string,
  body: string,
  flag: "reminder24hSent" | "reminder30mSent",
) {
  try {
    await createNotification({
      userId: booking.clientId,
      type: "BOOKING_REMINDER",
      title,
      body,
      data: { bookingId: booking.id, startAt: booking.startAt.toISOString() },
    });
    await prisma.booking.update({
      where: { id: booking.id },
      data: { [flag]: true },
    });
  } catch (error) {
    console.error("Failed to send booking reminder", booking.id, error);
  }
}

export async function processReminders() {
  const settings = await getSettings();
  const now = new Date();

  if (settings.reminder24hEnabled) {
    const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        reminder24hSent: false,
        startAt: { gte: from, lte: to },
      },
      include: reminderInclude,
    });
    for (const booking of bookings) {
      await sendReminder(
        booking,
        "Booking in 24 hours",
        `Your ${booking.service.name} at ${booking.salon.name} is tomorrow.`,
        "reminder24hSent",
      );
    }
  }

  if (settings.reminder30mEnabled) {
    const from = new Date(now.getTime() + 25 * 60 * 1000);
    const to = new Date(now.getTime() + 35 * 60 * 1000);
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["PENDING", "CONFIRMED"] },
        reminder30mSent: false,
        startAt: { gte: from, lte: to },
      },
      include: reminderInclude,
    });
    for (const booking of bookings) {
      await sendReminder(
        booking,
        "Booking in 30 minutes",
        `Your ${booking.service.name} at ${booking.salon.name} starts soon.`,
        "reminder30mSent",
      );
    }
  }
}
