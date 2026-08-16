import type { ExpenseCategory } from "@prisma/client";
import type { Request, Response } from "express";
import {
  calculateSalaries,
  createExpense,
  deleteExpense,
  getFinanceDashboard,
  getProfit,
  getRevenue,
  listExpenses,
  updateExpense,
} from "../services/finance.service";
import { AppError } from "../utils/app-error";
import { created, ok, paginated } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { routeParam, routeQuery } from "../utils/route-params";

function financeUser(req: Request) {
  const user = req.user!;
  if (user.role === "OWNER" && !user.ownerProfileId) {
    throw AppError.forbidden("Owner profile required");
  }
  return { role: user.role, ownerProfileId: user.ownerProfileId };
}

export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{
    salonId: string;
    page: number;
    limit: number;
    category?: string;
    from?: Date;
    to?: Date;
  }>(req);
  const result = await listExpenses({
    salonId: query.salonId,
    user: financeUser(req),
    page: query.page,
    limit: query.limit,
    category: query.category as ExpenseCategory | undefined,
    from: query.from,
    to: query.to,
  });
  return paginated(res, result);
});

export const postExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await createExpense({
    salonId: req.body.salonId,
    user: financeUser(req),
    actorId: req.user!.id,
    category: req.body.category,
    amount: req.body.amount,
    date: req.body.date,
    note: req.body.note,
    barberId: req.body.barberId,
  });
  return created(res, expense);
});

export const patchExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await updateExpense({
    expenseId: routeParam(req),
    user: financeUser(req),
    actorId: req.user!.id,
    category: req.body.category,
    amount: req.body.amount,
    date: req.body.date,
    note: req.body.note,
    barberId: req.body.barberId,
  });
  return ok(res, expense);
});

export const removeExpense = asyncHandler(async (req: Request, res: Response) => {
  await deleteExpense({
    expenseId: routeParam(req),
    user: financeUser(req),
    actorId: req.user!.id,
  });
  return ok(res, { deleted: true });
});

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{
    salonId: string;
    periodStart: Date;
    periodEnd: Date;
  }>(req);
  const dashboard = await getFinanceDashboard({
    salonId: query.salonId,
    user: financeUser(req),
    actorId: req.user!.id,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
  });
  return ok(res, dashboard);
});

export const getSalonRevenue = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{
    salonId: string;
    periodStart: Date;
    periodEnd: Date;
  }>(req);
  const revenue = await getRevenue(
    query.salonId,
    financeUser(req),
    query.periodStart,
    query.periodEnd,
  );
  return ok(res, revenue);
});

export const getSalonProfit = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{
    salonId: string;
    periodStart: Date;
    periodEnd: Date;
  }>(req);
  const profit = await getProfit({
    salonId: query.salonId,
    user: financeUser(req),
    actorId: req.user!.id,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
  });
  return ok(res, profit);
});

export const getSalary = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{
    salonId: string;
    periodStart: Date;
    periodEnd: Date;
    persist?: boolean;
  }>(req);
  const salary = await calculateSalaries({
    salonId: query.salonId,
    user: financeUser(req),
    actorId: req.user!.id,
    periodStart: query.periodStart,
    periodEnd: query.periodEnd,
    persist: query.persist,
  });
  return ok(res, salary);
});
