import { prisma } from "../config/prisma";
import { calculateSalaryAmount } from "../services/finance.service";
import { writeAudit } from "../services/audit.service";
import { roundMoney, toNumber } from "../utils/money";
import { previousUtcDayRange } from "../utils/time";

export async function processFinanceAggregation(now = new Date()) {
  const { from, to, dateKey } = previousUtcDayRange(now);

  const existingPlatform = await prisma.auditLog.findFirst({
    where: {
      action: "FINANCE_AGGREGATED",
      entityType: "Platform",
      entityId: dateKey,
    },
  });
  if (existingPlatform) {
    return { skipped: true, dateKey };
  }

  const salons = await prisma.salon.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
  });

  const salonSnapshots: Array<{
    salonId: string;
    revenue: number;
    expenses: number;
    salaryEstimate: number;
    profitEstimate: number;
  }> = [];

  for (const salon of salons) {
    const [paidPayments, expensesAgg, completedBookings, staff] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: "PAID",
          createdAt: { gte: from, lt: to },
          booking: { salonId: salon.id },
        },
        select: { amount: true },
      }),
      prisma.expense.aggregate({
        where: {
          salonId: salon.id,
          date: { gte: from, lt: to },
          category: { not: "SALARY" },
        },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.booking.findMany({
        where: {
          salonId: salon.id,
          status: "COMPLETED",
          actualEndAt: { gte: from, lt: to },
        },
        select: { price: true, barberId: true },
      }),
      prisma.salonStaff.findMany({
        where: { salonId: salon.id, status: "ACTIVE" },
        include: {
          barber: { select: { id: true, userId: true } },
        },
      }),
    ]);

    const revenue = roundMoney(paidPayments.reduce((sum, row) => sum + toNumber(row.amount), 0));
    const expenses = roundMoney(toNumber(expensesAgg._sum.amount ?? 0));

    const servicesByBarber = new Map<string, number>();
    for (const booking of completedBookings) {
      servicesByBarber.set(
        booking.barberId,
        roundMoney((servicesByBarber.get(booking.barberId) ?? 0) + toNumber(booking.price)),
      );
    }

    const salaryBreakdown = staff.map((member) => {
      const servicesTotal = servicesByBarber.get(member.barberId) ?? 0;
      const salary = calculateSalaryAmount(
        member.salaryType,
        toNumber(member.salaryFixed),
        toNumber(member.salaryPercent),
        servicesTotal,
      );
      return {
        barberUserId: member.barber.userId,
        type: member.salaryType,
        servicesTotal,
        ...salary,
      };
    });

    const salaryEstimate = roundMoney(salaryBreakdown.reduce((sum, row) => sum + row.totalAmount, 0));
    const profitEstimate = roundMoney(revenue - salaryEstimate - expenses);
    const snapshot = {
      date: dateKey,
      salonId: salon.id,
      salonName: salon.name,
      from: from.toISOString(),
      to: to.toISOString(),
      revenue,
      paymentCount: paidPayments.length,
      expenses,
      expenseCount: expensesAgg._count._all,
      completedBookingCount: completedBookings.length,
      salaryEstimate,
      profitEstimate,
      salaryBreakdown,
    };

    await writeAudit({
      action: "FINANCE_AGGREGATED",
      entityType: "Salon",
      entityId: `${salon.id}:${dateKey}`,
      metadata: snapshot,
    });

    salonSnapshots.push({
      salonId: salon.id,
      revenue,
      expenses,
      salaryEstimate,
      profitEstimate,
    });
  }

  const platform = {
    date: dateKey,
    from: from.toISOString(),
    to: to.toISOString(),
    salonCount: salonSnapshots.length,
    revenue: roundMoney(salonSnapshots.reduce((sum, row) => sum + row.revenue, 0)),
    expenses: roundMoney(salonSnapshots.reduce((sum, row) => sum + row.expenses, 0)),
    salaryEstimate: roundMoney(salonSnapshots.reduce((sum, row) => sum + row.salaryEstimate, 0)),
    profitEstimate: roundMoney(salonSnapshots.reduce((sum, row) => sum + row.profitEstimate, 0)),
  };

  await writeAudit({
    action: "FINANCE_AGGREGATED",
    entityType: "Platform",
    entityId: dateKey,
    metadata: platform,
  });

  return { skipped: false, dateKey, platform, salonCount: salonSnapshots.length };
}
