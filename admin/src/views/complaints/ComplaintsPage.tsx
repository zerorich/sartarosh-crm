"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { DataTable, Column } from "@/shared/ui/DataTable";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { Button } from "@/shared/ui/Button";
import { ComplaintStatusBadge } from "@/entities/complaint/ui/ComplaintStatusBadge";
import { ComplaintActionModal } from "@/features/complaint-moderation/ui/ComplaintActionModal";
import { Complaint } from "@/entities/complaint/model/types";
import { useComplaintsQuery } from "@/entities/complaint/api/complaint.queries";
import { formatDate, formatPhone } from "@/shared/lib/utils";
import { AlertTriangle, Edit3, Building2 } from "lucide-react";

export function ComplaintsPage() {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const { data, isLoading, isError, error, refetch } = useComplaintsQuery({
    page,
    limit: 20,
    status: status === "ALL" ? undefined : status,
  });

  const columns: Column<Complaint>[] = [
    {
      key: "subject",
      header: "Complaint Subject & Details",
      render: (c) => (
        <div className="space-y-1 max-w-sm">
          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            {c.subject}
          </p>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {c.body}
          </p>
          {c.adminNote && (
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold pt-0.5">
              Admin Note: {c.adminNote}
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
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {c.client.firstName || c.client.lastName
              ? `${c.client.firstName || ""} ${c.client.lastName || ""}`.trim()
              : "Client"}
          </p>
          <p className="text-slate-400 font-mono">{formatPhone(c.client.phone)}</p>
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
      header: "Filed At",
      sortable: true,
      render: (c) => (
        <span className="text-xs text-slate-500">{formatDate(c.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Resolution",
      align: "right",
      render: (c) => (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          onClick={() => setSelectedComplaint(c)}
        >
          Manage
        </Button>
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
            { value: "ALL", label: "All Complaints" },
            { value: "OPEN", label: "Open (Unresolved)" },
            { value: "IN_REVIEW", label: "In Review" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "REJECTED", label: "Rejected" },
          ]}
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
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

      {/* Action Modal */}
      {selectedComplaint && (
        <ComplaintActionModal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          complaint={selectedComplaint}
        />
      )}
    </AdminLayout>
  );
}

export default ComplaintsPage;

