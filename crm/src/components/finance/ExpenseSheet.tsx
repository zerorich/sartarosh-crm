"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useCreateExpense, useDeleteExpense, useSalonStaff, useUpdateExpense } from "@/hooks/queries";
import { getErrorMessage } from "@/lib/error-messages";
import { fullName, toDateKey } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/types/finance";
import { EXPENSE_CATEGORY_LABEL } from "@/types/finance";
import { EXPENSE_CATEGORIES } from "./constants";

interface ExpenseSheetProps {
  onClose: () => void;
  salonId: string;
  /** Berilsa — tahrirlash rejimi, bo'lmasa — yangi xarajat qo'shish. Har safar
   * ochilganda parent komponent bu sheet'ni yangi `key` bilan mount qiladi,
   * shu sababli boshlang'ich holatlar shu yerda to'g'ridan-to'g'ri props'dan
   * olinishi mumkin (effekt ichida setState kerak emas). */
  expense?: Expense | null;
}

export function ExpenseSheet({ onClose, salonId, expense }: ExpenseSheetProps) {
  const createExpense = useCreateExpense(salonId);
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const staff = useSalonStaff(salonId);

  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? "OTHER");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [date, setDate] = useState(expense ? toDateKey(new Date(expense.date)) : toDateKey(new Date()));
  const [note, setNote] = useState(expense?.note ?? "");
  const [barberId, setBarberId] = useState(expense?.barberId ?? "");
  const [error, setError] = useState<string | null>(null);

  const activeStaff = (staff.data ?? []).filter((s) => s.status === "ACTIVE");
  const pending = createExpense.isPending || updateExpense.isPending || deleteExpense.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input = {
      category,
      amount: Number(amount),
      date: new Date(date).toISOString(),
      note: note.trim() || undefined,
      barberId: barberId || undefined,
    };
    try {
      if (expense) {
        await updateExpense.mutateAsync({
          id: expense.id,
          input: { ...input, note: note.trim() || null, barberId: barberId || null },
        });
      } else {
        await createExpense.mutateAsync(input);
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete() {
    if (!expense) return;
    if (!window.confirm("Ushbu xarajatni o'chirishga ishonchingiz komilmi?")) return;
    setError(null);
    try {
      await deleteExpense.mutateAsync(expense.id);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Sheet open onClose={onClose} title={expense ? "Xarajatni tahrirlash" : "Yangi xarajat"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted" htmlFor="expense-category">
            Toifa
          </label>
          <select
            id="expense-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {EXPENSE_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted" htmlFor="expense-amount">
              Summa (so&apos;m)
            </label>
            <input
              id="expense-amount"
              type="number"
              min={0}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted" htmlFor="expense-date">
              Sana
            </label>
            <input
              id="expense-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>

        {activeStaff.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted" htmlFor="expense-barber">
              Sartarosh (ixtiyoriy)
            </label>
            <select
              id="expense-barber"
              value={barberId}
              onChange={(e) => setBarberId(e.target.value)}
              className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">Tanlanmagan</option>
              {activeStaff.map((s) => (
                <option key={s.barberId} value={s.barberId}>
                  {fullName(s.barber.user) || s.barber.user.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted" htmlFor="expense-note">
            Izoh (ixtiyoriy)
          </label>
          <textarea
            id="expense-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="resize-none rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" loading={createExpense.isPending || updateExpense.isPending} fullWidth>
          {expense ? "Saqlash" : "Qo'shish"}
        </Button>
        {expense && (
          <Button type="button" variant="danger" loading={deleteExpense.isPending} disabled={pending} fullWidth onClick={handleDelete}>
            O&apos;chirish
          </Button>
        )}
      </form>
    </Sheet>
  );
}
