"use client";

import React from "react";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Users, Scissors, UserCheck } from "lucide-react";
import { formatNumber } from "@/shared/lib/utils";

export function UserGrowthChart() {
  const roles = [
    { role: "Clients", count: 11840, percent: 94.8, color: "bg-indigo-600", icon: Users },
    { role: "Barbers", count: 482, percent: 3.9, color: "bg-purple-600", icon: Scissors },
    { role: "Salon Owners", count: 148, percent: 1.2, color: "bg-amber-500", icon: UserCheck },
    { role: "System Admins", count: 12, percent: 0.1, color: "bg-rose-500", icon: Users },
  ];

  return (
    <Card>
      <CardHeader
        title="User Base Composition"
        subtitle="Distribution across user roles and access levels"
      />
      <CardBody className="space-y-5">
        {/* Multi-segment progress bar */}
        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
          {roles.map((r) => (
            <div
              key={r.role}
              style={{ width: `${Math.max(2, r.percent)}%` }}
              className={`${r.color} h-full transition-all duration-500`}
              title={`${r.role}: ${r.count}`}
            />
          ))}
        </div>

        {/* Legend / Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.role} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${r.color}`} />
                  <span>{r.role}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {formatNumber(r.count)}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {r.percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
