"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExpensesTab } from "@/components/finance/ExpensesTab";
import { OverviewTab } from "@/components/finance/OverviewTab";
import { PeriodPicker, periodForPreset, type PeriodPreset } from "@/components/finance/PeriodPicker";
import { SalaryTab } from "@/components/finance/SalaryTab";
import { useAuth } from "@/hooks/useAuth";
import { useMySalons } from "@/hooks/queries";
import { cn } from "@/lib/utils";

type FinanceTab = "overview" | "expenses" | "salary";

const TABS: { value: FinanceTab; label: string }[] = [
  { value: "overview", label: "Umumiy" },
  { value: "expenses", label: "Xarajatlar" },
  { value: "salary", label: "Oyliklar" },
];

export default function FinancePage() {
  const router = useRouter();
  const { isOwner, isLoading: authLoading } = useAuth();
  const salons = useMySalons();
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [tab, setTab] = useState<FinanceTab>("overview");
  const [preset, setPreset] = useState<PeriodPreset>("thisMonth");

  useEffect(() => {
    if (!authLoading && !isOwner) {
      router.replace("/");
    }
  }, [authLoading, isOwner, router]);

  if (authLoading || !isOwner) {
    return <div className="mx-auto max-w-2xl px-4 py-6"><Skeleton className="h-48 w-full" /></div>;
  }

  const items = salons.data?.items ?? [];
  const salonId = selectedSalonId ?? items[0]?.id;
  const { periodStart, periodEnd } = periodForPreset(preset);

  if (salons.isLoading) return <div className="mx-auto max-w-2xl px-4 py-6"><Skeleton className="h-48 w-full" /></div>;
  if (salons.error) return <ErrorState error={salons.error} onRetry={() => salons.refetch()} />;
  if (!salonId) return <EmptyState icon={Wallet} title="Sizga tegishli salon topilmadi" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Moliya</h1>

      {items.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {items.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSalonId(s.id)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium",
                salonId === s.id ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                tab === t.value ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <PeriodPicker value={preset} onChange={setPreset} />
      </div>

      {tab === "overview" && <OverviewTab salonId={salonId} periodStart={periodStart} periodEnd={periodEnd} />}
      {tab === "expenses" && <ExpensesTab salonId={salonId} periodStart={periodStart} periodEnd={periodEnd} />}
      {tab === "salary" && <SalaryTab salonId={salonId} periodStart={periodStart} periodEnd={periodEnd} />}
    </div>
  );
}
