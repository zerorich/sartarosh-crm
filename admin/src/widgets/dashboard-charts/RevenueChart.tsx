"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { formatCurrency } from "@/shared/lib/utils";
import { TrendingUp } from "lucide-react";

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  deposits: number;
}

const defaultMonthlyData: MonthlyRevenueData[] = [
  { month: "Jan", revenue: 24000000, deposits: 6000000 },
  { month: "Feb", revenue: 31000000, deposits: 7800000 },
  { month: "Mar", revenue: 42000000, deposits: 10500000 },
  { month: "Apr", revenue: 48000000, deposits: 12000000 },
  { month: "May", revenue: 59000000, deposits: 14750000 },
  { month: "Jun", revenue: 78000000, deposits: 19500000 },
  { month: "Jul", revenue: 86000000, deposits: 21500000 },
  { month: "Aug", revenue: 95000000, deposits: 23750000 },
];

export function RevenueChart({ data = defaultMonthlyData }: { data?: MonthlyRevenueData[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.revenue));

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Revenue & Deposits Growth"
        subtitle="Gross platform turnover and online advance deposits (UZS)"
        action={
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white" />
              <span className="text-slate-600 dark:text-slate-300">Total</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-300">Deposit</span>
            </div>
          </div>
        }
      />
      <CardBody className="flex-1 flex flex-col justify-end pt-8">
        <div className="flex items-end justify-between gap-2 h-52 sm:h-60 w-full pt-6">
          {data.map((item, idx) => {
            const heightPercent = Math.max(12, Math.round((item.revenue / maxVal) * 100));
            const depositHeightPercent = Math.max(15, Math.round((item.deposits / item.revenue) * 100));
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.month}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-14 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none animate-in fade-in zoom-in-95">
                    <p className="font-bold">{formatCurrency(item.revenue)}</p>
                    <p className="text-[9px] text-rose-300">
                      Dep: {formatCurrency(item.deposits)}
                    </p>
                  </div>
                )}

                {/* Bars */}
                <div className="w-full max-w-[40px] flex flex-col justify-end h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 relative overflow-hidden ${
                      isHovered
                        ? "bg-slate-900 dark:bg-slate-100 shadow-md scale-105"
                        : "bg-slate-800/90 dark:bg-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    {/* Inner Deposit Segment */}
                    <div
                      style={{ height: `${depositHeightPercent}%` }}
                      className="absolute bottom-0 w-full bg-rose-500/90 rounded-t-sm"
                    />
                  </div>
                </div>

                <span className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-emerald-600 font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>+24.8% vs last quarter</span>
          </div>
          <span>YTD Total: 485,200,000 UZS</span>
        </div>
      </CardBody>
    </Card>
  );
}
