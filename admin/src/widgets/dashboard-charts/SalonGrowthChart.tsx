"use client";

import React from "react";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Building2, MapPin } from "lucide-react";

export function SalonGrowthChart() {
  const regions = [
    { city: "Tashkent City", salons: 98, activeBarbers: 310, percent: 62 },
    { city: "Samarkand", salons: 24, activeBarbers: 72, percent: 15 },
    { city: "Bukhara", salons: 18, activeBarbers: 54, percent: 11 },
    { city: "Fergana", salons: 12, activeBarbers: 32, percent: 8 },
    { city: "Namangan", salons: 6, activeBarbers: 14, percent: 4 },
  ];

  return (
    <Card>
      <CardHeader
        title="Salon Geographic Distribution"
        subtitle="Active registered salons & partner studios by region"
      />
      <CardBody className="space-y-4">
        {regions.map((reg) => (
          <div key={reg.city} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{reg.city}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <span className="font-bold text-slate-900 dark:text-white">{reg.salons} salons</span>
                <span className="text-[11px]">({reg.activeBarbers} barbers)</span>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${reg.percent}%` }}
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
