import { prisma } from "../config/prisma";
import { writeAudit } from "../services/audit.service";
import { roundMoney, toNumber } from "../utils/money";
import { previousUtcDayRange } from "../utils/time";

export async function processDailyReports(now = new Date()) {
  const { from, to, dateKey } = previousUtcDayRange(now);

  const existing = await prisma.auditLog.findFirst({
    where: {
      action: "DAILY_REPORT_GENERATED",
      entityType: "Platform",
      entityId: dateKey,
    },
  });
  if (existing) {
    return { skipped: true, dateKey };
  }

  const [bookingsByStatus, completedCount, payments, newUsers, reviews, complaints, paidRows] =
    await Promise.all([
      prisma.booking.groupBy({
        by: ["status"],
        where: { createdAt: { gte: from, lt: to } },
        _count: { _all: true },
      }),
      prisma.booking.count({
        where: { status: "COMPLETED", actualEndAt: { gte: from, lt: to } },
      }),
      prisma.payment.aggregate({
        where: { status: "PAID", createdAt: { gte: from, lt: to } },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: from, lt: to } } }),
      prisma.review.count({ where: { createdAt: { gte: from, lt: to } } }),
      prisma.complaint.count({ where: { createdAt: { gte: from, lt: to } } }),
      prisma.payment.findMany({
        where: { status: "PAID", createdAt: { gte: from, lt: to } },
        select: { amount: true, booking: { select: { salonId: true } } },
      }),
    ]);

  const bookingsCreated = bookingsByStatus.reduce((sum, row) => sum + row._count._all, 0);
  const bookingsByStatusMap = Object.fromEntries(
    bookingsByStatus.map((row) => [row.status, row._count._all]),
  );
  const revenue = roundMoney(toNumber(payments._sum.amount ?? 0));

  const salonRevenue = new Map<string, { revenue: number; paymentCount: number }>();
  for (const row of paidRows) {
    const salonId = row.booking.salonId;
    const current = salonRevenue.get(salonId) ?? { revenue: 0, paymentCount: 0 };
    current.revenue = roundMoney(current.revenue + toNumber(row.amount));
    current.paymentCount += 1;
    salonRevenue.set(salonId, current);
  }

  const salonBookings = await prisma.booking.groupBy({
    by: ["salonId"],
    where: { createdAt: { gte: from, lt: to } },
    _count: { _all: true },
  });

  const salonIds = new Set([...salonRevenue.keys(), ...salonBookings.map((row) => row.salonId)]);

  const platform = {
    date: dateKey,
    from: from.toISOString(),
    to: to.toISOString(),
    bookingsCreated,
    bookingsByStatus: bookingsByStatusMap,
    completedCount,
    revenue,
    paymentCount: payments._count._all,
    newUsers,
    reviews,
    complaints,
    salonCount: salonIds.size,
  };

  await writeAudit({
    action: "DAILY_REPORT_GENERATED",
    entityType: "Platform",
    entityId: dateKey,
    metadata: platform,
  });

  const bookingCountBySalon = new Map(salonBookings.map((row) => [row.salonId, row._count._all]));

  for (const salonId of salonIds) {
    const money = salonRevenue.get(salonId) ?? { revenue: 0, paymentCount: 0 };
    await writeAudit({
      action: "DAILY_REPORT_GENERATED",
      entityType: "Salon",
      entityId: `${salonId}:${dateKey}`,
      metadata: {
        date: dateKey,
        salonId,
        bookingsCreated: bookingCountBySalon.get(salonId) ?? 0,
        revenue: money.revenue,
        paymentCount: money.paymentCount,
      },
    });
  }

  return { skipped: false, dateKey, platform, salonReports: salonIds.size };
}
