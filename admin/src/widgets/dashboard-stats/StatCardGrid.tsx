"use client";

import React from "react";
import {
  Users,
  Building2,
  Scissors,
  CalendarCheck,
  CreditCard,
  Flame,
  Clock,
  AlertOctagon,
} from "lucide-react";
import { StatCard } from "@/shared/ui/StatCard";
import { formatCurrency, formatNumber } from "@/shared/lib/utils";

export interface DashboardMetrics {
  totalUsers?: number;
  totalSalons?: number;
  totalBarbers?: number;
  totalBookings?: number;
  totalRevenue?: number;
  revenueGrowth?: number;
  bookingsGrowth?: number;
  pendingSalons?: number;
  complaintsCount?: number;
}

function formatGrowth(value?: number): { value: string; positive: boolean } | undefined {
  if (value === undefined) return undefined;
  const positive = value >= 0;
  return { value: `${positive ? "+" : ""}${value.toFixed(1)}%`, positive };
}

export function StatCardGrid({
  metrics,
  isLoading,
}: {
  metrics?: DashboardMetrics;
  isLoading?: boolean;
}) {
  const data = {
    totalUsers: metrics?.totalUsers ?? 0,
    totalSalons: metrics?.totalSalons ?? 0,
    totalBarbers: metrics?.totalBarbers ?? 0,
    totalBookings: metrics?.totalBookings ?? 0,
    totalRevenue: metrics?.totalRevenue ?? 0,
    pendingSalons: metrics?.pendingSalons ?? 0,
    complaintsCount: metrics?.complaintsCount ?? 0,
  };

  const loadingValue = isLoading ? "…" : undefined;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        title="Total Users"
        value={loadingValue ?? formatNumber(data.totalUsers) + " Users"}
        icon={Users}
        color="indigo"
      />
      <StatCard
        title="Total Salons"
        value={loadingValue ?? formatNumber(data.totalSalons) + " Salons"}
        icon={Building2}
        color="sky"
      />
      <StatCard
        title="Total Barbers"
        value={loadingValue ?? formatNumber(data.totalBarbers) + " Barbers"}
        icon={Scissors}
        color="purple"
      />
      <StatCard
        title="Total Bookings"
        value={loadingValue ?? formatNumber(data.totalBookings)}
        icon={CalendarCheck}
        color="emerald"
        trend={formatGrowth(metrics?.bookingsGrowth)}
      />
      <StatCard
        title="Total Platform Revenue"
        value={loadingValue ?? formatCurrency(data.totalRevenue)}
        icon={CreditCard}
        color="emerald"
        trend={formatGrowth(metrics?.revenueGrowth)}
      />
      <StatCard
        title="Pending Salons"
        value={loadingValue ?? `${data.pendingSalons} Pending`}
        icon={Clock}
        color="amber"
        subtitle="Requires approval review"
      />
      <StatCard
        title="Open Complaints"
        value={loadingValue ?? `${data.complaintsCount} Issues`}
        icon={AlertOctagon}
        color="rose"
        subtitle="Priority support resolution"
      />
      <StatCard
        title="Active Barbers"
        value={loadingValue ?? formatNumber(data.totalBarbers)}
        icon={Flame}
        color="slate"
        subtitle="Staffed at active salons"
      />
    </div>
  );
}
