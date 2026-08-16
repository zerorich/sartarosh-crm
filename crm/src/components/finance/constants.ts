import { Building2, Droplets, Megaphone, MoreHorizontal, Wallet, Wrench, Zap, type LucideIcon } from "lucide-react";
import type { ExpenseCategory } from "@/types/finance";
import type { SalaryType } from "@/types/barber";

export const EXPENSE_CATEGORY_ICON: Record<ExpenseCategory, LucideIcon> = {
  EQUIPMENT: Wrench,
  CONSUMABLE: Droplets,
  RENT: Building2,
  UTILITY: Zap,
  MARKETING: Megaphone,
  SALARY: Wallet,
  OTHER: MoreHorizontal,
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "EQUIPMENT",
  "CONSUMABLE",
  "RENT",
  "UTILITY",
  "MARKETING",
  "SALARY",
  "OTHER",
];

export const SALARY_TYPE_LABEL: Record<SalaryType, string> = {
  FIXED: "Belgilangan",
  PERCENTAGE: "Foizli",
  FIXED_PLUS_PERCENTAGE: "Aralash",
};
