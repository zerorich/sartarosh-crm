"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { DataTable, Column } from "@/shared/ui/DataTable";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { Button } from "@/shared/ui/Button";
import { SalonStatusBadge } from "@/entities/salon/ui/SalonStatusBadge";
import { BarberRating } from "@/entities/barber/ui/BarberRating";
import { Salon, SalonStatus } from "@/entities/salon/model/types";
import { useSalonsQuery } from "@/entities/salon/api/salon.queries";
import { ApproveSalonModal } from "@/features/salon-actions/ui/ApproveSalonModal";
import { RejectSalonModal } from "@/features/salon-actions/ui/RejectSalonModal";
import { BlockSalonModal } from "@/features/salon-actions/ui/BlockSalonModal";
import { formatDate, formatPhone } from "@/shared/lib/utils";
import {
  Building2,
  Eye,
  CheckCircle,
  XCircle,
  ShieldBan,
  MapPin,
  Users,
} from "lucide-react";

export function SalonsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Selected salon for action modals
  const [approveSalon, setApproveSalon] = useState<Salon | null>(null);
  const [rejectSalon, setRejectSalon] = useState<Salon | null>(null);
  const [blockSalon, setBlockSalon] = useState<Salon | null>(null);

  const { data, isLoading, isError, error, refetch } = useSalonsQuery({
    page,
    limit: 20,
    status: status === "ALL" ? undefined : (status as SalonStatus),
  });

  const columns: Column<Salon>[] = [
    {
      key: "name",
      header: "Salon & Location",
      sortable: true,
      render: (salon) => (
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
            {salon.coverUrl ? (
              <img src={salon.coverUrl} alt={salon.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Building2 className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            <Link
              href={`/admin/salons/${salon.id}`}
              className="font-bold text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
            >
              {salon.name}
            </Link>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate max-w-[200px]">{salon.address}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (salon) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            {salon.owner?.user
              ? `${salon.owner.user.firstName || ""} ${salon.owner.user.lastName || ""}`.trim()
              : "Owner ID: " + salon.id}
          </p>
          <p className="text-slate-400 font-mono">
            {salon.owner?.user?.phone ? formatPhone(salon.owner.user.phone) : "—"}
          </p>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (salon) => (
        <BarberRating rating={salon.rating} reviewCount={salon.reviewCount} />
      ),
    },
    {
      key: "staffCount",
      header: "Barbers",
      align: "center",
      render: (salon) => (
        <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>{salon.staffCount || 0}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (salon) => <SalonStatusBadge status={salon.status} />,
    },
    {
      key: "createdAt",
      header: "Joined Date",
      sortable: true,
      render: (salon) => (
        <span className="text-xs text-slate-500">{formatDate(salon.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (salon) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link href={`/admin/salons/${salon.id}`}>
            <Button variant="ghost" size="icon" title="View Details">
              <Eye className="w-4 h-4 text-slate-500 hover:text-slate-900" />
            </Button>
          </Link>

          {salon.status === "PENDING" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                title="Approve Salon"
                onClick={() => setApproveSalon(salon)}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Reject Salon"
                onClick={() => setRejectSalon(salon)}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}

          {salon.status === "ACTIVE" && (
            <Button
              variant="ghost"
              size="icon"
              title="Block Salon"
              onClick={() => setBlockSalon(salon)}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <ShieldBan className="w-4 h-4" />
            </Button>
          )}
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
            <Building2 className="w-6 h-6 text-sky-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Salon Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review partner barbershops, approve onboarding applications, and manage service listings.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <SearchInput
          placeholder="Search by salon name or address..."
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
              { value: "PENDING", label: "Pending Approval" },
              { value: "ACTIVE", label: "Active" },
              { value: "REJECTED", label: "Rejected" },
              { value: "BLOCKED", label: "Blocked" },
            ]}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(s) => s.id}
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        onRetry={refetch}
        emptyTitle="No salons found"
        emptyDescription="Try adjusting your status filter or search keywords."
        pagination={{
          currentPage: page,
          totalItems: data?.total || 0,
          pageSize: 20,
          onPageChange: setPage,
        }}
      />

      {/* Action Modals */}
      {approveSalon && (
        <ApproveSalonModal
          isOpen={!!approveSalon}
          onClose={() => setApproveSalon(null)}
          salonId={approveSalon.id}
          salonName={approveSalon.name}
        />
      )}

      {rejectSalon && (
        <RejectSalonModal
          isOpen={!!rejectSalon}
          onClose={() => setRejectSalon(null)}
          salonId={rejectSalon.id}
          salonName={rejectSalon.name}
        />
      )}

      {blockSalon && (
        <BlockSalonModal
          isOpen={!!blockSalon}
          onClose={() => setBlockSalon(null)}
          salonId={blockSalon.id}
          salonName={blockSalon.name}
        />
      )}
    </AdminLayout>
  );
}

export default SalonsPage;

