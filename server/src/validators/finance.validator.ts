import { z } from "zod";
import { dateSchema, moneySchema, uuidSchema } from "./common";
import { paginationSchema } from "../utils/pagination";

const expenseCategorySchema = z.enum([
  "EQUIPMENT",
  "CONSUMABLE",
  "RENT",
  "UTILITY",
  "MARKETING",
  "SALARY",
  "OTHER",
]);

export const createExpenseSchema = z.object({
  salonId: uuidSchema,
  category: expenseCategorySchema,
  amount: moneySchema,
  date: dateSchema,
  note: z.string().trim().max(500).optional(),
  barberId: uuidSchema.optional(),
});

export const updateExpenseSchema = z.object({
  category: expenseCategorySchema.optional(),
  amount: moneySchema.optional(),
  date: dateSchema.optional(),
  note: z.string().trim().max(500).nullable().optional(),
  barberId: uuidSchema.nullable().optional(),
});

export const expenseListQuerySchema = paginationSchema.extend({
  salonId: uuidSchema,
  category: expenseCategorySchema.optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
});

export const financePeriodQuerySchema = z.object({
  salonId: uuidSchema,
  periodStart: dateSchema,
  periodEnd: dateSchema,
  persist: z.coerce.boolean().optional(),
});

export const expenseIdParamSchema = z.object({
  id: uuidSchema,
});
