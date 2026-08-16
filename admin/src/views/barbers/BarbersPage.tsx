"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { DataTable, Column } from "@/shared/ui/DataTable";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { Button } from "@/shared/ui/Button";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { BarberRating } from "@/entities/barber/ui/BarberRating";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { Barber, BarberStatus } from "@/entities/barber/model/types";
import { useBarbersQuery } from "@/entities/barber/api/barber.queries";
import { formatCurrency, formatPhone } from "@/shared/lib/utils";
import { Scissors, Eye, Building2, CalendarCheck } from "lucide-react";

export function BarbersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useBarbersQuery({
    page,
    limit: 20,
    status: status === "ALL" ? undefined : (status as BarberStatus),
  });

  const columns: Column<Barber>[] = [
    {
      key: "name",
      header: "Barber",
      sortable: true,
      render: (barber) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            firstName={barber.user.firstName}
            lastName={barber.user.lastName}
            src={barber.user.avatarUrl}
            size="sm"
            statusDot={barber.user.isBlocked ? "blocked" : "online"}
          />
          <div>
            <Link
              href={`/admin/barbers/${barber.id}`}
              className="font-bold text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
            >
              {barber.user.firstName || barber.user.lastName
                ? `${barber.user.firstName || ""} ${barber.user.lastName || ""}`.trim()
                : "Barber"}
            </Link>
            <p className="text-xs text-slate-400 font-mono">{formatPhone(barber.user.phone)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "salon",
      header: "Affiliated Salon",
      render: (barber) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {barber.salon?.name || "Independent"}
          </span>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Client Rating",
      sortable: true,
      render: (barber) => (
        <BarberRating rating={barber.rating} reviewCount={barber.reviewCount} />
      ),
    },
    {
      key: "bookingsCount",
      header: "Bookings",
      align: "center",
      sortable: true,
      render: (barber) => (
        <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>{barber.bookingsCount || 0}</span>
        </div>
      ),
    },
    {
      key: "revenue",
      header: "Gross Revenue",
      align: "right",
      sortable: true,
      render: (barber) => (
        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
          {formatCurrency(barber.revenue || 0)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (barber) => (
        <StatusBadge type="salon" value={barber.status} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (barber) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/barbers/${barber.id}`}>
            <Button variant="ghost" size="icon" title="View Profile">
              <Eye className="w-4 h-4 text-slate-500 hover:text-slate-900" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Barbers Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor barber performance, client satisfaction ratings, bookings, and earned revenue.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <SearchInput
          placeholder="Search by barber name..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <FilterDropdown
            label="Status"
            selectedValue={status}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "BLOCKED", label: "Blocked" },
              { value: "SUSPENDED", label: "Suspended" },
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(b) => b.id}
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        onRetry={refetch}
        emptyTitle="No barbers found"
        emptyDescription="Try adjusting your status filter or search parameters."
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

export default BarbersPage;

