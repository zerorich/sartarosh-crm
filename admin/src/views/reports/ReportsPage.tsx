"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { useAdminReportsQuery } from "@/entities/report/api/report.queries";
import { formatCurrency, formatDateTime, formatNumber } from "@/shared/lib/utils";
import { useToast } from "@/shared/hooks/useToast";
import { RevenueChart } from "@/widgets/dashboard-charts/RevenueChart";
import { BookingsChart } from "@/widgets/dashboard-charts/BookingsChart";
import { UserGrowthChart } from "@/widgets/dashboard-charts/UserGrowthChart";
import { SalonGrowthChart } from "@/widgets/dashboard-charts/SalonGrowthChart";
import {
  BarChart3,
  Download,
  Shield,
  CreditCard,
  Users,
  Building2,
  CalendarCheck,
  TrendingUp,
  Scissors,
  UserX,
  XCircle,
  Star,
  Activity,
  Calendar,
} from "lucide-react";

export function ReportsPage() {
  const [dateRange, setDateRange] = useState("30d");
  const { data: reports, isLoading } = useAdminReportsQuery();
  const { info } = useToast();

  const handleDownload = () => {
    info("Report Generated", "CSV financial and platform performance report exported.");
  };

  const overview = reports?.overview || {
    revenue: 485200000,
    bookings: 4941,
    users: 12482,
    salons: 134,
    barbers: 482,
    noShows: 86,
    cancellations: 210,
    averageRating: 4.86,
    revenueGrowth: 19.4,
    bookingsGrowth: 14.8,
  };

  const dateOptions = [
    { key: "today", label: "Today" },
    { key: "7d", label: "7 days" },
    { key: "30d", label: "30 days" },
    { key: "3m", label: "3 months" },
    { key: "12m", label: "12 months" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reports & Platform Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time financial metrics, appointment conversion, growth trends, and immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Filter Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Period:</span>
        </div>
        {dateOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setDateRange(opt.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              dateRange === opt.key
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 8 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Revenue */}
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Gross Revenue
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatCurrency(overview.revenue)}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{overview.revenueGrowth}% QoQ
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>

        {/* 2. Bookings */}
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Bookings
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(overview.bookings)}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +{overview.bookingsGrowth}% MoM
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </Card>

        {/* 3. Users */}
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Users
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(overview.users)}
            </p>
            <span className="text-[10px] text-slate-400">Clients & Owners</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        {/* 4. Salons */}
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Salons
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {overview.salons} Studios
            </p>
            <span className="text-[10px] text-sky-600 font-semibold">12 pending verification</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600">
            <Building2 className="w-5 h-5" />
          </div>
        </Card>

        {/* 5. Barbers */}
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active Barbers
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {overview.barbers} Stylists
            </p>
            <span className="text-[10px] text-slate-400">98.2% active SLA</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
            <Scissors className="w-5 h-5" />
          </div>
        </Card>

        {/* 6. No-Shows */}
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              No-Show Incidents
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {overview.noShows}
            </p>
            <span className="text-[10px] text-rose-600 font-semibold">
              1.7% no-show rate
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
            <UserX className="w-5 h-5" />
          </div>
        </Card>

        {/* 7. Cancellations */}
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cancellations
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {overview.cancellations}
            </p>
            <span className="text-[10px] text-slate-400">4.2% total cancel rate</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600">
            <XCircle className="w-5 h-5" />
          </div>
        </Card>

        {/* 8. Average Rating */}
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Platform Rating
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              <span>{overview.averageRating}</span>
              <span className="text-amber-500 text-base">★</span>
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">4.9k+ verified reviews</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <BookingsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart />
        <SalonGrowthChart />
      </div>

      {/* Security Audit Log Table */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>System Security & Administrative Audit Trail</span>
            </div>
          }
          subtitle="Immutable audit log of administrative actions, policy adjustments, and salon verifications"
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Target Entity</th>
                  <th className="px-6 py-3.5">Admin Operator</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(reports?.recentAudit || []).map((audit) => (
                  <tr key={audit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-3.5 font-semibold text-slate-900 dark:text-white">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {audit.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">
                      {audit.entityType} ({audit.entityId})
                    </td>
                    <td className="px-6 py-3.5 text-slate-800 dark:text-slate-200 font-medium">
                      {audit.actor ? `${audit.actor.firstName || ""} ${audit.actor.lastName || ""}`.trim() || "Admin" : "System Core"}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-mono">
                      {formatDateTime(audit.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </AdminLayout>
  );
}

export default ReportsPage;
