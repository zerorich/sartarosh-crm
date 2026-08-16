import { ShieldCheck } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface PaymentSummaryProps {
  depositAmount: number;
  remainingAmount: number;
}

export function PaymentSummary({ depositAmount, remainingAmount }: PaymentSummaryProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="size-4 text-success" aria-hidden />
        Oldindan to&apos;lov (depozit)
      </div>
      <p className="mt-3 text-3xl font-bold">{formatMoney(depositAmount)}</p>
      <p className="mt-1 text-xs text-muted">
        Qolgan {formatMoney(remainingAmount)} summa salonda xizmatdan so&apos;ng to&apos;lanadi.
      </p>
    </div>
  );
}
