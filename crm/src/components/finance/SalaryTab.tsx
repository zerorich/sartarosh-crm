"use client";

import { useState } from "react";
import { CheckCircle2, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { RowsSkeleton } from "@/components/ui/Skeleton";
import { useSalary, usePersistSalary } from "@/hooks/queries";
import { getErrorMessage } from "@/lib/error-messages";
import { formatMoney } from "@/lib/utils";
import { SALARY_TYPE_LABEL } from "./constants";

interface SalaryTabProps {
  salonId: string;
  periodStart: string;
  periodEnd: string;
}

function avatarUserFor(barberName: string) {
  const [firstName, ...rest] = barberName.trim().split(/\s+/);
  return { firstName: firstName || null, lastName: rest.join(" ") || null, avatarUrl: null };
}

export function SalaryTab({ salonId, periodStart, periodEnd }: SalaryTabProps) {
  const salary = useSalary(salonId, periodStart, periodEnd);
  const persistSalary = usePersistSalary();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handlePersist() {
    setError(null);
    setSaved(false);
    try {
      await persistSalary.mutateAsync({ salonId, periodStart, periodEnd });
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (salary.isLoading) return <RowsSkeleton count={4} />;
  if (salary.error || !salary.data) {
    return <ErrorState error={salary.error} onRetry={() => salary.refetch()} />;
  }

  const { breakdown, totalSalary } = salary.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
        <div>
          <p className="text-xs font-medium text-muted">Jami oyliklar</p>
          <p className="text-xl font-bold">{formatMoney(totalSalary)}</p>
        </div>
        <Button size="sm" loading={persistSalary.isPending} onClick={handlePersist}>
          Hisoblash va saqlash
        </Button>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && (
        <p className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="size-4" aria-hidden /> Oyliklar hisoblanib saqlandi.
        </p>
      )}

      {breakdown.length === 0 ? (
        <EmptyState icon={Users} title="Bu davrda sartaroshlar uchun oylik topilmadi" />
      ) : (
        <div className="flex flex-col gap-3">
          {breakdown.map((b) => (
            <div key={b.barberUserId} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <Avatar user={avatarUserFor(b.barberName)} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{b.barberName}</p>
                  <p className="text-xs text-muted">{SALARY_TYPE_LABEL[b.type]}</p>
                </div>
                <p className="shrink-0 text-lg font-bold">{formatMoney(b.totalAmount)}</p>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                <BreakdownStat label="Xizmatlar" value={b.servicesTotal} />
                <BreakdownStat label="Belgilangan" value={b.fixedAmount} />
                <BreakdownStat label="Foizdan" value={b.percentAmount} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BreakdownStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold">{formatMoney(value)}</p>
    </div>
  );
}
