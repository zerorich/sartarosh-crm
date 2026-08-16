"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { DataTable, Column } from "@/shared/ui/DataTable";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { Button } from "@/shared/ui/Button";
import { ComplaintStatusBadge } from "@/entities/complaint/ui/ComplaintStatusBadge";
import { Complaint, ComplaintStatus } from "@/entities/complaint/model/types";
import { useComplaintsQuery } from "@/entities/complaint/api/complaint.queries";
import { formatDate, formatEmail } from "@/shared/lib/utils";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { AlertTriangle, Edit3, Building2, Eye } from "lucide-react";

export function ComplaintsPage() {
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, error, refetch } = useComplaintsQuery({
    page,
    limit: 20,
    status: status === "ALL" ? undefined : (status as ComplaintStatus),
  });

  const filteredItems = useMemo(() => {
    let items = data?.items ?? [];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      items = items.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.client.email.toLowerCase().includes(q) ||
          c.client.firstName?.toLowerCase().includes(q) ||
          c.client.lastName?.toLowerCase().includes(q)
      );
    }

    return items;
  }, [data?.items, debouncedSearch]);

  const columns: Column<Complaint>[] = [
    {
      key: "id",
      header: "Dispute ID",
      render: (c) => (
        <Link
          href={`/admin/complaints/${c.id}`}
          className="font-mono text-xs font-bold text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
        >
          #{c.id}
        </Link>
      ),
    },
    {
      key: "subject",
      header: "Subject & Category",
      render: (c) => (
        <div className="space-y-1 max-w-sm">
          <Link
            href={`/admin/complaints/${c.id}`}
            className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-rose-600 transition-colors block"
          >
            {c.subject}
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              GENERAL
            </span>
            {c.bookingId && (
              <span className="text-[10px] text-slate-400 font-mono">
                Booking: #{c.bookingId}
              </span>
            )}
          </div>
          {c.adminNote && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5 line-clamp-1">
              Note: {c.adminNote}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "client",
      header: "Complainant",
      render: (c) => (
        <div className="space-y-0.5 text-xs">
          <Link
            href={`/admin/users/${c.clientId}`}
            className="font-bold text-slate-800 dark:text-slate-200 hover:text-rose-600 transition-colors"
          >
            {c.client.firstName || c.client.lastName
              ? `${c.client.firstName || ""} ${c.client.lastName || ""}`.trim()
              : "Client"}
          </Link>
          <p className="text-slate-400 font-mono">{formatEmail(c.client.email)}</p>
        </div>
      ),
    },
    {
      key: "salon",
      header: "Target Salon",
      render: (c) => (
        <div className="flex items-center gap-1.5 text-xs">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {c.salon?.name || "General Platform Issue"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <ComplaintStatusBadge status={c.status} />,
    },
    {
      key: "createdAt",
      header: "Filed Date",
      sortable: true,
      render: (c) => (
        <span className="text-xs text-slate-500">{formatDate(c.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => (
        <Link href={`/admin/complaints/${c.id}`}>
          <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
            Manage
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
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Customer Complaints & Disputes
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Resolve customer disputes, barber delays, overcharges, and issue compensation vouchers.
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <SearchInput
          placeholder="Search by dispute subject, client email, or ID..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Status"
            selectedValue={status}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "OPEN", label: "Open" },
              { value: "IN_REVIEW", label: "In Review" },
              { value: "RESOLVED", label: "Resolved" },
              { value: "REJECTED", label: "Rejected" },
            ]}
          />
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        onRetry={refetch}
        emptyTitle="No complaints found"
        emptyDescription="Great news! There are no open customer complaints matching your filters."
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

export default ComplaintsPage;
