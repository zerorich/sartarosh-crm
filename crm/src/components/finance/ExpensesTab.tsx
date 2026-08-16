"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { RowsSkeleton } from "@/components/ui/Skeleton";
import { useExpenses } from "@/hooks/queries";
import { cn, formatDate, formatMoney } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/types/finance";
import { EXPENSE_CATEGORY_LABEL } from "@/types/finance";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_ICON } from "./constants";
import { ExpenseSheet } from "./ExpenseSheet";

const PAGE_LIMIT = 20;

interface ExpensesTabProps {
  salonId: string;
  periodStart: string;
  periodEnd: string;
}

export function ExpensesTab({ salonId, periodStart, periodEnd }: ExpensesTabProps) {
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const expenses = useExpenses({
    salonId,
    page,
    limit: PAGE_LIMIT,
    category: category ?? undefined,
    from: periodStart,
    to: periodEnd,
  });

  const items = expenses.data?.items ?? [];
  const total = expenses.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setSheetOpen(true);
  }

  function changeCategory(next: ExpenseCategory | null) {
    setCategory(next);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <CategoryChip label="Barchasi" active={category === null} onClick={() => changeCategory(null)} />
          {EXPENSE_CATEGORIES.map((c) => (
            <CategoryChip
              key={c}
              label={EXPENSE_CATEGORY_LABEL[c]}
              active={category === c}
              onClick={() => changeCategory(c)}
            />
          ))}
        </div>
        <Button size="sm" onClick={openCreate} className="shrink-0">
          <Plus className="size-4" aria-hidden />
        </Button>
      </div>

      {expenses.isLoading ? (
        <RowsSkeleton count={5} />
      ) : expenses.error ? (
        <ErrorState error={expenses.error} onRetry={() => expenses.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState icon={Receipt} title="Bu davrda xarajatlar yo'q" />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {items.map((expense) => {
              const Icon = EXPENSE_CATEGORY_ICON[expense.category];
              return (
                <button
                  key={expense.id}
                  onClick={() => openEdit(expense)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left hover:bg-surface-muted"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-muted">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{EXPENSE_CATEGORY_LABEL[expense.category]}</p>
                    <p className="truncate text-xs text-muted">
                      {formatDate(expense.date)}
                      {expense.note ? ` · ${expense.note}` : ""}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">{formatMoney(expense.amount)}</p>
                </button>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Oldingi"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border disabled:opacity-40"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <span className="text-sm text-muted">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                aria-label="Keyingi"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border disabled:opacity-40"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          )}
        </>
      )}

      {sheetOpen && (
        <ExpenseSheet
          key={editing?.id ?? "new"}
          onClose={() => setSheetOpen(false)}
          salonId={salonId}
          expense={editing}
        />
      )}
    </div>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border",
      )}
    >
      {label}
    </button>
  );
}
