"use client";

import type { ComponentType } from "react";
import { BarChart3, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFinanceDashboard } from "@/hooks/queries";
import { cn, formatMoney } from "@/lib/utils";
import { EXPENSE_CATEGORY_LABEL } from "@/types/finance";
import { EXPENSE_CATEGORY_ICON } from "./constants";

interface OverviewTabProps {
  salonId: string;
  periodStart: string;
  periodEnd: string;
}

export function OverviewTab({ salonId, periodStart, periodEnd }: OverviewTabProps) {
  const dashboard = useFinanceDashboard(salonId, periodStart, periodEnd);

  if (dashboard.isLoading) return <Skeleton className="h-64 w-full" />;
  if (dashboard.error || !dashboard.data) {
    return <ErrorState error={dashboard.error} onRetry={() => dashboard.refetch()} />;
  }

  const d = dashboard.data;
  const maxCategory = Math.max(1, ...d.expenseByCategory.map((c) => c.amount));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={TrendingUp} label="Daromad" value={d.revenue} />
        <StatCard
          icon={d.profit >= 0 ? TrendingUp : TrendingDown}
          label="Foyda"
          value={d.profit}
          tone={d.profit >= 0 ? "success" : "danger"}
        />
        <StatCard icon={Wallet} label="Oyliklar" value={d.salary} />
        <StatCard icon={Receipt} label="Xarajatlar" value={d.expenses} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Xarajatlar toifalar bo&apos;yicha</h2>
        {d.expenseByCategory.length === 0 ? (
          <EmptyState icon={BarChart3} title="Bu davrda xarajat yo'q" />
        ) : (
          <div className="flex flex-col gap-3">
            {d.expenseByCategory.map((c) => {
              const Icon = EXPENSE_CATEGORY_ICON[c.category];
              const pct = Math.max(4, Math.round((c.amount / maxCategory) * 100));
              return (
                <div key={c.category} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className="size-4 text-muted" aria-hidden />
                      {EXPENSE_CATEGORY_LABEL[c.category]}
                    </span>
                    <span className="text-muted">{formatMoney(c.amount)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
  tone?: "default" | "success" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 text-muted">
        <Icon className="size-4" aria-hidden />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p
        className={cn(
          "text-lg font-bold",
          tone === "success" && "text-success",
          tone === "danger" && "text-danger",
        )}
      >
        {formatMoney(value)}
      </p>
    </div>
  );
}
