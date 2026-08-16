"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Calendar } from "lucide-react";

export interface DayBookingData {
  day: string;
  completed: number;
  cancelled: number;
}

const defaultWeeklyBookings: DayBookingData[] = [
  { day: "Mon", completed: 142, cancelled: 8 },
  { day: "Tue", completed: 168, cancelled: 11 },
  { day: "Wed", completed: 195, cancelled: 14 },
  { day: "Thu", completed: 210, cancelled: 9 },
  { day: "Fri", completed: 290, cancelled: 16 },
  { day: "Sat", completed: 345, cancelled: 22 },
  { day: "Sun", completed: 310, cancelled: 18 },
];

export function BookingsChart({ data = defaultWeeklyBookings }: { data?: DayBookingData[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.completed + d.cancelled));

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Weekly Booking Volume"
        subtitle="Completed sessions vs cancellations per day"
        action={
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <span className="text-slate-600 dark:text-slate-300">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-slate-600 dark:text-slate-300">Cancelled</span>
            </div>
          </div>
        }
      />
      <CardBody className="flex-1 flex flex-col justify-end pt-8">
        <div className="flex items-end justify-between gap-3 h-52 sm:h-60 w-full pt-6">
          {data.map((item, idx) => {
            const completedHeight = Math.round((item.completed / maxVal) * 100);
            const cancelledHeight = Math.max(4, Math.round((item.cancelled / maxVal) * 100));
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={item.day}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap z-20 pointer-events-none animate-in fade-in zoom-in-95">
                    <span>{item.completed} completed</span>
                    <span className="text-rose-300 ml-1.5">({item.cancelled} cancelled)</span>
                  </div>
                )}

                {/* Stacked bar */}
                <div className="w-full max-w-[36px] flex flex-col justify-end gap-1 h-full">
                  <div
                    style={{ height: `${cancelledHeight}%` }}
                    className="w-full bg-rose-400/80 rounded-t-md transition-all duration-200"
                  />
                  <div
                    style={{ height: `${completedHeight}%` }}
                    className={`w-full rounded-md transition-all duration-300 ${
                      isHovered
                        ? "bg-indigo-600 shadow-md scale-105"
                        : "bg-indigo-500/90 dark:bg-indigo-600 hover:bg-indigo-600"
                    }`}
                  />
                </div>

                <span className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Peak Day: Saturday (367 Total)</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            1,660 Total This Week
          </span>
        </div>
      </CardBody>
    </Card>
  );
}
