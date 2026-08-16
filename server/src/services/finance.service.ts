import type { ExpenseCategory, Role, SalaryType } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { roundMoney, toNumber } from "../utils/money";
import { writeAudit } from "./audit.service";

export interface SalaryBreakdown {
  barberUserId: string;
  barberName: string;
  type: SalaryType;
  fixedAmount: number;
  percentAmount: number;
  servicesTotal: number;
  totalAmount: number;
}

export function calculateSalaryAmount(
  type: SalaryType,
  salaryFixed: number,
  salaryPercent: number,
  servicesTotal: number,
): { fixedAmount: number; percentAmount: number; totalAmount: number } {
  let fixedAmount = 0;
  let percentAmount = 0;

  if (type === "FIXED" || type === "FIXED_PLUS_PERCENTAGE") {
    fixedAmount = roundMoney(salaryFixed);
  }
  if (type === "PERCENTAGE" || type === "FIXED_PLUS_PERCENTAGE") {
    percentAmount = roundMoney((servicesTotal * salaryPercent) / 100);
  }

  return {
    fixedAmount,
    percentAmount,
    totalAmount: roundMoney(fixedAmount + percentAmount),
  };
}

interface SalonAccessUser {
  role: Role;
  ownerProfileId?: string;
}

async function assertSalonAccess(salonId: string, user: SalonAccessUser) {
  const salon = await prisma.salon.findUnique({ where: { id: salonId } });
  if (!salon) throw AppError.notFound("Salon not found");
  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") return salon;
  if (!user.ownerProfileId || salon.ownerId !== user.ownerProfileId) {
    throw AppError.forbidden("You do not own this salon");
  }
  return salon;
}

export async function createExpense(params: {
  salonId: string;
  user: SalonAccessUser;
  actorId: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  note?: string;
  barberId?: string;
}) {
  await assertSalonAccess(params.salonId, params.user);

  const expense = await prisma.expense.create({
    data: {
      salonId: params.salonId,
      barberId: params.barberId,
      category: params.category,
      amount: params.amount,
      date: params.date,
      note: params.note,
    },
  });

  await writeAudit({
    actorId: params.actorId,
    action: "EXPENSE_CREATED",
    entityType: "Expense",
    entityId: expense.id,
    metadata: { salonId: params.salonId, category: params.category, amount: params.amount },
  });

  return expense;
}

export async function listExpenses(params: {
  salonId: string;
  user: SalonAccessUser;
  page: number;
  limit: number;
  category?: ExpenseCategory;
  from?: Date;
  to?: Date;
}) {
  await assertSalonAccess(params.salonId, params.user);

  const where = {
    salonId: params.salonId,
    ...(params.category ? { category: params.category } : {}),
    ...(params.from || params.to
      ? {
          date: {
            ...(params.from ? { gte: params.from } : {}),
            ...(params.to ? { lte: params.to } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return { items, page: params.page, limit: params.limit, total };
}

export async function updateExpense(params: {
  expenseId: string;
  user: SalonAccessUser;
  actorId: string;
  category?: ExpenseCategory;
  amount?: number;
  date?: Date;
  note?: string | null;
  barberId?: string | null;
}) {
  const expense = await prisma.expense.findUnique({
    where: { id: params.expenseId },
    include: { salon: true },
  });
  if (!expense) throw AppError.notFound("Expense not found");
  if (params.user.role !== "ADMIN" && params.user.role !== "SUPER_ADMIN") {
    if (!params.user.ownerProfileId || expense.salon.ownerId !== params.user.ownerProfileId) {
      throw AppError.forbidden("You do not own this expense");
    }
  }

  const updated = await prisma.expense.update({
    where: { id: params.expenseId },
    data: {
      ...(params.category !== undefined ? { category: params.category } : {}),
      ...(params.amount !== undefined ? { amount: params.amount } : {}),
      ...(params.date !== undefined ? { date: params.date } : {}),
      ...(params.note !== undefined ? { note: params.note } : {}),
      ...(params.barberId !== undefined ? { barberId: params.barberId } : {}),
    },
  });

  await writeAudit({
    actorId: params.actorId,
    action: "EXPENSE_UPDATED",
    entityType: "Expense",
    entityId: expense.id,
  });

  return updated;
}

export async function deleteExpense(params: {
  expenseId: string;
  user: SalonAccessUser;
  actorId: string;
}) {
  const expense = await prisma.expense.findUnique({
    where: { id: params.expenseId },
    include: { salon: true },
  });
  if (!expense) throw AppError.notFound("Expense not found");
  if (params.user.role !== "ADMIN" && params.user.role !== "SUPER_ADMIN") {
    if (!params.user.ownerProfileId || expense.salon.ownerId !== params.user.ownerProfileId) {
      throw AppError.forbidden("You do not own this expense");
    }
  }

  await prisma.expense.delete({ where: { id: params.expenseId } });

  await writeAudit({
    actorId: params.actorId,
    action: "EXPENSE_DELETED",
    entityType: "Expense",
    entityId: params.expenseId,
  });
}

export async function getRevenue(salonId: string, user: SalonAccessUser, from: Date, to: Date) {
  await assertSalonAccess(salonId, user);

  const payments = await prisma.payment.findMany({
    where: {
      status: "PAID",
      createdAt: { gte: from, lte: to },
      booking: { salonId },
    },
    select: { amount: true },
  });

  const total = roundMoney(payments.reduce((sum, p) => sum + toNumber(p.amount), 0));
  return { salonId, from, to, revenue: total, paymentCount: payments.length };
}

export async function calculateSalaries(params: {
  salonId: string;
  user: SalonAccessUser;
  actorId: string;
  periodStart: Date;
  periodEnd: Date;
  persist?: boolean;
}) {
  await assertSalonAccess(params.salonId, params.user);

  const staff = await prisma.salonStaff.findMany({
    where: { salonId: params.salonId, status: "ACTIVE" },
    include: {
      barber: {
        include: { user: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });

  const breakdown: SalaryBreakdown[] = [];

  for (const member of staff) {
    const bookings = await prisma.booking.findMany({
      where: {
        salonId: params.salonId,
        barberId: member.barberId,
        status: "COMPLETED",
        actualEndAt: { gte: params.periodStart, lte: params.periodEnd },
      },
      select: { price: true },
    });

    const servicesTotal = roundMoney(bookings.reduce((sum, b) => sum + toNumber(b.price), 0));
    const salary = calculateSalaryAmount(
      member.salaryType,
      toNumber(member.salaryFixed),
      toNumber(member.salaryPercent),
      servicesTotal,
    );

    const entry: SalaryBreakdown = {
      barberUserId: member.barber.user.id,
      barberName: [member.barber.user.firstName, member.barber.user.lastName].filter(Boolean).join(" ") || member.barber.user.id,
      type: member.salaryType,
      fixedAmount: salary.fixedAmount,
      percentAmount: salary.percentAmount,
      servicesTotal,
      totalAmount: salary.totalAmount,
    };
    breakdown.push(entry);

    if (params.persist) {
      await prisma.salary.create({
        data: {
          salonId: params.salonId,
          barberUserId: member.barber.user.id,
          periodStart: params.periodStart,
          periodEnd: params.periodEnd,
          type: member.salaryType,
          fixedAmount: salary.fixedAmount,
          percentAmount: salary.percentAmount,
          totalAmount: salary.totalAmount,
          servicesTotal,
        },
      });
    }
  }

  const totalSalary = roundMoney(breakdown.reduce((sum, s) => sum + s.totalAmount, 0));

  await writeAudit({
    actorId: params.actorId,
    action: "SALARY_CALCULATED",
    entityType: "Salon",
    entityId: params.salonId,
    metadata: { periodStart: params.periodStart, periodEnd: params.periodEnd, totalSalary },
  });

  return { salonId: params.salonId, periodStart: params.periodStart, periodEnd: params.periodEnd, breakdown, totalSalary };
}

export async function getProfit(params: {
  salonId: string;
  user: SalonAccessUser;
  actorId: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  const [revenueResult, salaryResult, expensesAgg] = await Promise.all([
    getRevenue(params.salonId, params.user, params.periodStart, params.periodEnd),
    calculateSalaries({
      salonId: params.salonId,
      user: params.user,
      actorId: params.actorId,
      periodStart: params.periodStart,
      periodEnd: params.periodEnd,
      persist: false,
    }),
    prisma.expense.aggregate({
      where: {
        salonId: params.salonId,
        date: { gte: params.periodStart, lte: params.periodEnd },
        category: { not: "SALARY" },
      },
      _sum: { amount: true },
    }),
  ]);

  const expenses = roundMoney(toNumber(expensesAgg._sum.amount ?? 0));
  const profit = roundMoney(revenueResult.revenue - salaryResult.totalSalary - expenses);

  return {
    salonId: params.salonId,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
    revenue: revenueResult.revenue,
    salary: salaryResult.totalSalary,
    expenses,
    profit,
    salaryBreakdown: salaryResult.breakdown,
  };
}

export async function getFinanceDashboard(params: {
  salonId: string;
  user: SalonAccessUser;
  actorId: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  const [revenue, profit, expenseByCategory] = await Promise.all([
    getRevenue(params.salonId, params.user, params.periodStart, params.periodEnd),
    getProfit(params),
    prisma.expense.groupBy({
      by: ["category"],
      where: {
        salonId: params.salonId,
        date: { gte: params.periodStart, lte: params.periodEnd },
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    salonId: params.salonId,
    periodStart: params.periodStart,
    periodEnd: params.periodEnd,
    revenue: revenue.revenue,
    profit: profit.profit,
    salary: profit.salary,
    expenses: profit.expenses,
    expenseByCategory: expenseByCategory.map((row) => ({
      category: row.category,
      amount: roundMoney(toNumber(row._sum.amount ?? 0)),
    })),
    salaryBreakdown: profit.salaryBreakdown,
  };
}
