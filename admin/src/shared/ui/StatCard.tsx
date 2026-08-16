import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Card } from "./Card";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string | number;
    positive?: boolean;
    label?: string;
  };
  subtitle?: string;
  color?: "slate" | "indigo" | "emerald" | "amber" | "rose" | "sky" | "purple";
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = "indigo",
  className,
}: StatCardProps) {
  const colorMap = {
    slate: {
      bg: "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-200/80",
      iconBg: "bg-slate-900 text-white dark:bg-slate-700",
      gaze: "from-slate-500/10",
    },
    indigo: {
      bg: "bg-indigo-50/50 text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200 border-indigo-100",
      iconBg: "bg-indigo-600 text-white",
      gaze: "from-indigo-500/10",
    },
    emerald: {
      bg: "bg-emerald-50/50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200 border-emerald-100",
      iconBg: "bg-emerald-600 text-white",
      gaze: "from-emerald-500/10",
    },
    amber: {
      bg: "bg-amber-50/50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 border-amber-100",
      iconBg: "bg-amber-500 text-white",
      gaze: "from-amber-500/10",
    },
    rose: {
      bg: "bg-rose-50/50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200 border-rose-100",
      iconBg: "bg-rose-600 text-white",
      gaze: "from-rose-500/10",
    },
    sky: {
      bg: "bg-sky-50/50 text-sky-900 dark:bg-sky-950/30 dark:text-sky-200 border-sky-100",
      iconBg: "bg-sky-600 text-white",
      gaze: "from-sky-500/10",
    },
    purple: {
      bg: "bg-purple-50/50 text-purple-900 dark:bg-purple-950/30 dark:text-purple-200 border-purple-100",
      iconBg: "bg-purple-600 text-white",
      gaze: "from-purple-500/10",
    },
  };

  const selected = colorMap[color];

  return (
    <Card
      hover
      className={cn(
        "relative p-5 overflow-hidden transition-all duration-300 group border bg-white dark:bg-slate-900",
        className
      )}
    >
      <div
        className={cn(
          "absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-60 bg-gradient-to-br to-transparent pointer-events-none transition-all duration-500 group-hover:scale-125 group-hover:opacity-90",
          selected.gaze
        )}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {value}
            </h3>
          </div>
        </div>

        <div
          className={cn(
            "p-3 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110",
            selected.iconBg
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        {trend ? (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px]",
                trend.positive !== false
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
              )}
            >
              {trend.positive !== false ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              {trend.label || "vs last month"}
            </span>
          </div>
        ) : subtitle ? (
          <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>
        ) : (
          <span className="text-slate-400 text-[11px]">Updated live</span>
        )}
      </div>
    </Card>
  );
}
