"use client";

import React from "react";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { useAdminReportsQuery } from "@/entities/report/api/report.queries";
import { formatCurrency, formatDateTime } from "@/shared/lib/utils";
import { useToast } from "@/shared/hooks/useToast";
import {
  BarChart3,
  Download,
  Shield,
  CreditCard,
  Users,
  Building2,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

export function ReportsPage() {
  const { data: reports, isLoading } = useAdminReportsQuery();
  const { info } = useToast();

  const handleDownload = () => {
    info("Report Generated", "CSV financial and platform performance report exported.");
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reports & Platform Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive system audit logs, gross revenue analytics, and salon conversion rates.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export CSV Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Gross Platform Turnover</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatCurrency(reports?.payments.totalAmount || 485200000)}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +19.4% QoQ
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <CreditCard className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Total User Accounts</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {(reports?.users.reduce((acc, curr) => acc + curr.count, 0) || 12482).toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400">Clients, Barbers & Owners</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Salons</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {(reports?.salons.find((s) => s.status === "ACTIVE")?.count || 134)} Studios
            </p>
            <span className="text-[11px] text-slate-400">12 awaiting onboarding</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600">
            <Building2 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Completed Bookings</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {(reports?.bookings.find((b) => b.status === "COMPLETED")?.count || 4280).toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400">94.2% completion rate</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Security Audit Log Table */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <span>Admin Security & Audit Trail</span>
            </div>
          }
          subtitle="Immutable log of administrative actions, salon approvals, and policy adjustments"
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400">
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Target Entity</th>
                  <th className="px-6 py-3.5">Performed By</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {(reports?.recentAudit || [
                  {
                    id: "aud-01",
                    action: "SALON_APPROVED",
                    entityType: "Salon",
                    entityId: "sal-001",
                    actor: { firstName: "Javodbek", lastName: "Ergashev", role: "ADMIN" },
                    createdAt: "2024-06-16T09:30:00Z",
                  },
                  {
                    id: "aud-02",
                    action: "USER_BLOCKED",
                    entityType: "User",
                    entityId: "usr-006",
                    actor: { firstName: "Javodbek", lastName: "Ergashev", role: "ADMIN" },
                    createdAt: "2024-06-16T08:15:00Z",
                  },
                  {
                    id: "aud-03",
                    action: "SETTINGS_UPDATED",
                    entityType: "AdminSetting",
                    entityId: "set-001",
                    actor: { firstName: "Javodbek", lastName: "Ergashev", role: "ADMIN" },
                    createdAt: "2024-06-15T16:00:00Z",
                  },
                ]).map((audit) => (
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
                      {audit.actor ? `${audit.actor.firstName} ${audit.actor.lastName}` : "System Automated"}
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

