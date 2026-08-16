"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { DataTable, Column } from "@/shared/ui/DataTable";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { Button } from "@/shared/ui/Button";
import { BookingStatusBadge } from "@/entities/booking/ui/BookingStatusBadge";
import { Booking } from "@/entities/booking/model/types";
import { useBookingsQuery } from "@/entities/booking/api/booking.queries";
import { formatDate, formatDateTime, formatCurrency, formatPhone } from "@/shared/lib/utils";
import { CalendarCheck, Eye, Building2, Scissors } from "lucide-react";

export function BookingsPage() {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useBookingsQuery({
    page,
    limit: 20,
    status: status === "ALL" ? undefined : status,
  });

  const columns: Column<Booking>[] = [
    {
      key: "id",
      header: "Booking ID",
      render: (b) => (
        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          #{b.id}
        </span>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (b) => (
        <div className="space-y-0.5 text-xs">
          <Link
            href={`/admin/users/${b.clientId}`}
            className="font-bold text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
          >
            {b.client.firstName || b.client.lastName
              ? `${b.client.firstName || ""} ${b.client.lastName || ""}`.trim()
              : "Client"}
          </Link>
          <p className="text-slate-400 font-mono">{formatPhone(b.client.phone)}</p>
        </div>
      ),
    },
    {
      key: "salon",
      header: "Salon & Barber",
      render: (b) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{b.salon.name}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Scissors className="w-3 h-3 text-slate-400" />
            <span>{b.barber.user.firstName} {b.barber.user.lastName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service & Price",
      render: (b) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{b.service.name}</p>
          <p className="font-mono text-slate-500">{formatCurrency(b.price)}</p>
        </div>
      ),
    },
    {
      key: "startAt",
      header: "Appointment Time",
      sortable: true,
      render: (b) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {formatDateTime(b.startAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (b) => <BookingStatusBadge status={b.status} />,
    },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Customer Bookings
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time appointment schedule, booking statuses, deposits, and service completion logs.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <FilterDropdown
          label="Booking Status"
          selectedValue={status}
          onChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
          options={[
            { value: "ALL", label: "All Bookings" },
            { value: "CONFIRMED", label: "Confirmed" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "COMPLETED", label: "Completed" },
            { value: "CANCELLED", label: "Cancelled" },
            { value: "NO_SHOW", label: "No-Show" },
          ]}
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(b) => b.id}
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        onRetry={refetch}
        emptyTitle="No bookings found"
        emptyDescription="There are no appointments matching this status filter."
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

export default BookingsPage;

