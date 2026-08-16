"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { DataTable, Column } from "@/shared/ui/DataTable";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { PaymentStatusBadge } from "@/entities/payment/ui/PaymentStatusBadge";
import { Payment } from "@/entities/payment/model/types";
import { usePaymentsQuery } from "@/entities/payment/api/payment.queries";
import { formatCurrency, formatDateTime, formatPhone } from "@/shared/lib/utils";
import { CreditCard, ArrowUpRight, Building2 } from "lucide-react";

export function PaymentsPage() {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = usePaymentsQuery({
    page,
    limit: 20,
    status: status === "ALL" ? undefined : status,
  });

  const columns: Column<Payment>[] = [
    {
      key: "id",
      header: "Payment ID",
      render: (p) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          #{p.id}
        </span>
      ),
    },
    {
      key: "booking",
      header: "Salon & Client",
      render: (p) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {p.booking?.salon?.name || "Salon Booking"}
          </p>
          <p className="text-slate-400 font-mono">
            {p.booking?.client?.phone ? formatPhone(p.booking.client.phone) : "—"}
          </p>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortable: true,
      render: (p) => (
        <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
          {formatCurrency(p.amount)}
        </span>
      ),
    },
    {
      key: "method",
      header: "Payment Method",
      render: (p) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {p.method}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (p) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {p.type}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <PaymentStatusBadge status={p.status} />,
    },
    {
      key: "providerRef",
      header: "Gateway Reference",
      render: (p) => (
        <span className="font-mono text-xs text-slate-400">
          {p.providerRef || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Transaction Time",
      sortable: true,
      render: (p) => (
        <span className="text-xs text-slate-500">{formatDateTime(p.createdAt)}</span>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Payment Transactions
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit online advance deposits, full settlements, and payment gateway logs.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <FilterDropdown
          label="Status"
          selectedValue={status}
          onChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
          options={[
            { value: "ALL", label: "All Payments" },
            { value: "PAID", label: "Paid" },
            { value: "PENDING", label: "Pending" },
            { value: "FAILED", label: "Failed" },
            { value: "REFUNDED", label: "Refunded" },
          ]}
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(p) => p.id}
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        onRetry={refetch}
        emptyTitle="No payments recorded"
        emptyDescription="There are no payment transactions matching your filter criteria."
        pagination={{
          currentPage: page,
          totalItems: data?.total || 0,
          pageSize: 20,
          onPageChange: setPage,
        }}
      />
    </AdminLayout>
  );
}

export default PaymentsPage;

