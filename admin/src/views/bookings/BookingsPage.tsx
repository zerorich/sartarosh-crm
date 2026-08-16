"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { DataTable, Column } from "@/shared/ui/DataTable";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { Button } from "@/shared/ui/Button";
import { BookingStatusBadge } from "@/entities/booking/ui/BookingStatusBadge";
import { Booking } from "@/entities/booking/model/types";
import { useBookingsQuery } from "@/entities/booking/api/booking.queries";
import { formatDateTime, formatCurrency, formatEmail } from "@/shared/lib/utils";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { CalendarCheck, Eye, Building2, Scissors, CreditCard, Gift } from "lucide-react";

export function BookingsPage() {
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error, refetch } = useBookingsQuery({
    page,
    limit: 20,
    status: status === "ALL" ? undefined : status,
  });

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!debouncedSearch) return items;

    const q = debouncedSearch.toLowerCase();
    return items.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.client.email.toLowerCase().includes(q) ||
        b.client.firstName?.toLowerCase().includes(q) ||
        b.client.lastName?.toLowerCase().includes(q) ||
        b.salon.name.toLowerCase().includes(q) ||
        b.barber.user.firstName?.toLowerCase().includes(q) ||
        b.barber.user.lastName?.toLowerCase().includes(q)
    );
  }, [data?.items, debouncedSearch]);

  const columns: Column<Booking>[] = [
    {
      key: "id",
      header: "Booking ID",
      render: (b) => (
        <div className="space-y-1">
          <Link
            href={`/admin/bookings/${b.id}`}
            className="font-mono text-xs font-bold text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
          >
            #{b.id}
          </Link>
          {b.delayMinutes && b.delayMinutes > 0 ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
              <Gift className="w-3 h-3" /> +{b.delayMinutes}m delay
            </span>
          ) : null}
        </div>
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
          <p className="text-slate-400 font-mono">{formatEmail(b.client.email)}</p>
        </div>
      ),
    },
    {
      key: "salon",
      header: "Salon & Barber",
      render: (b) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[140px]">{b.salon.name}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Scissors className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[140px]">{b.barber.user.firstName} {b.barber.user.lastName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (b) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{b.service.name}</p>
          <p className="text-slate-400 text-[11px]">
            {b.service.durationMinutes ? `${b.service.durationMinutes} min` : "Standard"}
          </p>
        </div>
      ),
    },
    {
      key: "startAt",
      header: "Date & Time",
      sortable: true,
      render: (b) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {formatDateTime(b.scheduledStartAt || b.startAt)}
        </span>
      ),
    },
    {
      key: "price",
      header: "Amount & Deposit",
      align: "right",
      render: (b) => (
        <div className="text-right space-y-0.5 text-xs">
          <p className="font-mono font-bold text-slate-900 dark:text-white">
            {formatCurrency(b.price)}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium">
            Deposit: {formatCurrency(b.depositAmount)}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (b) => <BookingStatusBadge status={b.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (b) => (
        <Link href={`/admin/bookings/${b.id}`}>
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
            <CalendarCheck className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Customer Bookings
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time appointment schedule, booking statuses, deposits, and service completion logs.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <SearchInput
          placeholder="Search by ID, client, salon, or barber..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          className="w-full md:w-80"
        />

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <FilterDropdown
            label="Status"
            selectedValue={status}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "CONFIRMED", label: "Confirmed" },
              { value: "ARRIVED", label: "Arrived" },
              { value: "IN_PROGRESS", label: "In Service" },
              { value: "COMPLETED", label: "Completed" },
              { value: "CANCELLED", label: "Cancelled" },
              { value: "NO_SHOW", label: "No-Show" },
            ]}
          />
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        keyExtractor={(b) => b.id}
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        onRetry={refetch}
        emptyTitle="No bookings found"
        emptyDescription="There are no appointments matching your search and filter criteria."
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
