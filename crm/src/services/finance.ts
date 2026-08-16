import { apiClient } from "./client";
import type { Paginated } from "@/types/api";
import type {
  Expense,
  ExpenseCategory,
  FinanceDashboard,
  ProfitResult,
  RevenueResult,
  SalaryResult,
} from "@/types/finance";

export interface ListExpensesQuery {
  salonId: string;
  page?: number;
  limit?: number;
  category?: ExpenseCategory;
  from?: string;
  to?: string;
}

export function fetchExpenses(query: ListExpensesQuery) {
  return apiClient.get<Paginated<Expense>>("/finance/expenses", query);
}

export interface CreateExpenseInput {
  salonId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note?: string;
  barberId?: string;
}

export function createExpense(input: CreateExpenseInput) {
  return apiClient.post<Expense>("/finance/expenses", input);
}

export interface UpdateExpenseInput {
  category?: ExpenseCategory;
  amount?: number;
  date?: string;
  note?: string | null;
  barberId?: string | null;
}

export function updateExpense(id: string, input: UpdateExpenseInput) {
  return apiClient.patch<Expense>(`/finance/expenses/${id}`, input);
}

export function deleteExpense(id: string) {
  return apiClient.delete<{ deleted: true }>(`/finance/expenses/${id}`);
}

export interface PeriodQuery {
  salonId: string;
  periodStart: string;
  periodEnd: string;
}

export function fetchDashboard(query: PeriodQuery) {
  return apiClient.get<FinanceDashboard>("/finance/dashboard", query);
}

export function fetchRevenue(query: PeriodQuery) {
  return apiClient.get<RevenueResult>("/finance/revenue", query);
}

export function fetchProfit(query: PeriodQuery) {
  return apiClient.get<ProfitResult>("/finance/profit", query);
}

export function fetchSalary(query: PeriodQuery & { persist?: boolean }) {
  return apiClient.get<SalaryResult>("/finance/salary", query);
}
