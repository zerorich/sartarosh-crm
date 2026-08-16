"use client";

import React from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { StatCardGrid } from "@/widgets/dashboard-stats/StatCardGrid";
import { RevenueChart } from "@/widgets/dashboard-charts/RevenueChart";
import { BookingsChart } from "@/widgets/dashboard-charts/BookingsChart";
import { UserGrowthChart } from "@/widgets/dashboard-charts/UserGrowthChart";
import { SalonGrowthChart } from "@/widgets/dashboard-charts/SalonGrowthChart";
import { RecentActivityList } from "@/widgets/recent-activity/RecentActivityList";
import { useAdminReportsQuery } from "@/entities/report/api/report.queries";
import { Button } from "@/shared/ui/Button";
import {
  Download,
  Building2,
  AlertTriangle,
  Scissors,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/shared/hooks/useToast";

export function DashboardPage() {
  const { data: reports, isLoading } = useAdminReportsQuery();
  const { info } = useToast();

  const handleExport = () => {
    info("Report Exported", "Summary platform report has been generated and downloaded.");
  };

  return (
    <AdminLayout>
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-sky-600/20 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-rose-300 border border-white/10 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>CutZone Live Platform Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Javodbek!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Monitor real-time bookings, verify partner salons, oversee customer complaints, and ensure platform health.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-4 h-4" />}
            className="bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            Export Summary
          </Button>
          <Link href="/admin/salons">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Building2 className="w-4 h-4" />}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30"
            >
              Review Salons (12)
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <StatCardGrid />

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/salons?status=PENDING"
          className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">12 Pending Salons</p>
              <p className="text-[11px] text-slate-500">Awaiting approval review</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/complaints?status=OPEN"
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">4 Open Complaints</p>
              <p className="text-[11px] text-slate-500">Requires customer care action</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-rose-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/barbers"
          className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">482 Active Barbers</p>
              <p className="text-[11px] text-slate-500">View performance & ratings</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <BookingsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart />
        <SalonGrowthChart />
      </div>

      {/* Recent Activity Live Stream */}
      <RecentActivityList />
    </AdminLayout>
  );
}

export default DashboardPage;
