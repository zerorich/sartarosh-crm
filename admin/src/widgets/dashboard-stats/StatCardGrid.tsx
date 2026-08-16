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
import { formatCurrency } from "@/shared/lib/utils";

export interface DashboardMetrics {
  totalUsers?: number;
  totalSalons?: number;
  totalBarbers?: number;
  totalBookings?: number;
  totalRevenue?: number;
  activeToday?: number;
  pendingSalons?: number;
  complaintsCount?: number;
}

export function StatCardGrid({ metrics }: { metrics?: DashboardMetrics }) {
  const data = {
    totalUsers: metrics?.totalUsers ?? 12482,
    totalSalons: metrics?.totalSalons ?? 158,
    totalBarbers: metrics?.totalBarbers ?? 482,
    totalBookings: metrics?.totalBookings ?? 5410,
    totalRevenue: metrics?.totalRevenue ?? 485200000,
    activeToday: metrics?.activeToday ?? 98,
    pendingSalons: metrics?.pendingSalons ?? 12,
    complaintsCount: metrics?.complaintsCount ?? 4,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        title="Total Users"
        value={data.totalUsers.toLocaleString() + " Users"}
        icon={Users}
        color="indigo"
        trend={{ value: "+14.2%", positive: true }}
      />
      <StatCard
        title="Total Salons"
        value={data.totalSalons.toLocaleString() + " Salons"}
        icon={Building2}
        color="sky"
        trend={{ value: "+8.5%", positive: true }}
      />
      <StatCard
        title="Total Barbers"
        value={data.totalBarbers.toLocaleString() + " Barbers"}
        icon={Scissors}
        color="purple"
        trend={{ value: "+18.0%", positive: true }}
      />
      <StatCard
        title="Total Bookings"
        value={data.totalBookings.toLocaleString()}
        icon={CalendarCheck}
        color="emerald"
        trend={{ value: "+22.4%", positive: true }}
      />
      <StatCard
        title="Total Platform Revenue"
        value={formatCurrency(data.totalRevenue)}
        icon={CreditCard}
        color="emerald"
        trend={{ value: "+19.8%", positive: true }}
      />
      <StatCard
        title="Active Today"
        value={`${data.activeToday} Bookings`}
        icon={Flame}
        color="slate"
        subtitle="Real-time ongoing sessions"
      />
      <StatCard
        title="Pending Salons"
        value={`${data.pendingSalons} Pending`}
        icon={Clock}
        color="amber"
        subtitle="Requires approval review"
      />
      <StatCard
        title="Open Complaints"
        value={`${data.complaintsCount} Issues`}
        icon={AlertOctagon}
        color="rose"
        subtitle="Priority support resolution"
      />
    </div>
  );
}
