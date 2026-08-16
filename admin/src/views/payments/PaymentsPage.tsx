"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { DataTable, Column } from "@/shared/ui/DataTable";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { Button } from "@/shared/ui/Button";
import { PaymentStatusBadge } from "@/entities/payment/ui/PaymentStatusBadge";
import { Payment } from "@/entities/payment/model/types";
import { usePaymentsQuery } from "@/entities/payment/api/payment.queries";
import { formatCurrency, formatDateTime, formatPhone } from "@/shared/lib/utils";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { CreditCard, Eye, Building2 } from "lucide-react";

export function PaymentsPage() {
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error, refetch } = usePaymentsQuery({
    page,
    limit: 20,
    status: status === "ALL" ? undefined : status,
  });

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!debouncedSearch) return items;

    const q = debouncedSearch.toLowerCase();
    return items.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.bookingId.toLowerCase().includes(q) ||
        p.providerRef?.toLowerCase().includes(q) ||
        p.booking?.client?.phone.includes(q) ||
        p.booking?.salon?.name.toLowerCase().includes(q)
    );
  }, [data?.items, debouncedSearch]);

  const columns: Column<Payment>[] = [
    {
      key: "id",
      header: "Payment ID",
      render: (p) => (
        <Link
          href={`/admin/payments/${p.id}`}
          className="font-mono text-xs font-bold text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
        >
          #{p.id}
        </Link>
      ),
    },
    {
      key: "booking",
      header: "Booking & Client",
      render: (p) => (
        <div className="space-y-0.5 text-xs">
          <Link
            href={`/admin/bookings/${p.bookingId}`}
            className="font-semibold text-slate-800 dark:text-slate-200 hover:text-rose-600 transition-colors block"
          >
            {p.booking?.salon?.name || "Salon Booking"} (#{p.bookingId})
          </Link>
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
      header: "Method & Type",
      render: (p) => (
        <div className="space-y-0.5">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {p.method}
          </span>
          <p className="text-[10px] text-slate-400 font-medium">{p.type}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (p) => <PaymentStatusBadge status={p.status} />,
    },
    {
      key: "providerRef",
      header: "Gateway Ref",
      render: (p) => (
        <span className="font-mono text-xs text-slate-400">
          {p.providerRef || "—"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (p) => (
        <span className="text-xs text-slate-500">{formatDateTime(p.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (p) => (
        <Link href={`/admin/payments/${p.id}`}>
          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
            Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Payment Transactions
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit online advance deposits, full settlements, and payment gateway logs.
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <SearchInput
          placeholder="Search by Payment ID, client phone, or gateway ref..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          className="w-full md:w-80"
        />

        <div className="flex items-center gap-2">
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
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
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
