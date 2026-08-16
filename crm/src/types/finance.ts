import type { SalaryType } from "./barber";

export type ExpenseCategory =
  | "EQUIPMENT"
  | "CONSUMABLE"
  | "RENT"
  | "UTILITY"
  | "MARKETING"
  | "SALARY"
  | "OTHER";

export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  EQUIPMENT: "Asbob-uskuna",
  CONSUMABLE: "Sarf materiallari",
  RENT: "Ijara",
  UTILITY: "Kommunal to'lovlar",
  MARKETING: "Marketing",
  SALARY: "Oylik",
  OTHER: "Boshqa",
};

/** GET /api/finance/expenses bitta elementi. */
export interface Expense {
  id: string;
  salonId: string;
  barberId: string | null;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryBreakdown {
  barberUserId: string;
  barberName: string;
  type: SalaryType;
  fixedAmount: number;
  percentAmount: number;
  servicesTotal: number;
  totalAmount: number;
}

export interface ExpenseByCategory {
  category: ExpenseCategory;
  amount: number;
}

/** GET /api/finance/dashboard javobi. */
export interface FinanceDashboard {
  salonId: string;
  periodStart: string;
  periodEnd: string;
  revenue: number;
  profit: number;
  salary: number;
  expenses: number;
  expenseByCategory: ExpenseByCategory[];
  salaryBreakdown: SalaryBreakdown[];
}

/** GET /api/finance/revenue javobi. */
export interface RevenueResult {
  salonId: string;
  from: string;
  to: string;
  revenue: number;
  paymentCount: number;
}

/** GET /api/finance/profit javobi. */
export interface ProfitResult {
  salonId: string;
  periodStart: string;
  periodEnd: string;
  revenue: number;
  salary: number;
  expenses: number;
  profit: number;
  salaryBreakdown: SalaryBreakdown[];
}

/** GET /api/finance/salary javobi. */
export interface SalaryResult {
  salonId: string;
  periodStart: string;
  periodEnd: string;
  breakdown: SalaryBreakdown[];
  totalSalary: number;
}
