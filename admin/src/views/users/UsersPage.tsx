"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { DataTable, Column } from "@/shared/ui/DataTable";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { Button } from "@/shared/ui/Button";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { UserRoleBadge } from "@/entities/user/ui/UserRoleBadge";
import { User, UserRole } from "@/entities/user/model/types";
import { useUsersQuery } from "@/entities/user/api/user.queries";
import { BlockUserModal } from "@/features/block-user/ui/BlockUserModal";
import { UnblockUserModal } from "@/features/block-user/ui/UnblockUserModal";
import { formatDate, formatPhone } from "@/shared/lib/utils";
import { Eye, ShieldBan, ShieldCheck, UserPlus, Users as UsersIcon } from "lucide-react";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  // Selected user for block/unblock actions
  const [selectedUserForBlock, setSelectedUserForBlock] = useState<User | null>(null);
  const [selectedUserForUnblock, setSelectedUserForUnblock] = useState<User | null>(null);

  const { data, isLoading, isError, error, refetch } = useUsersQuery({
    page,
    limit: 20,
    search: search || undefined,
    role: role === "ALL" ? undefined : (role as UserRole),
  });

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User / Full Name",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <UserAvatar
            firstName={user.firstName}
            lastName={user.lastName}
            src={user.avatarUrl}
            size="sm"
            statusDot={user.isBlocked ? "blocked" : "online"}
          />
          <div>
            <Link
              href={`/admin/users/${user.id}`}
              className="font-bold text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
            >
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : "Unnamed User"}
            </Link>
            <p className="text-xs text-slate-400 font-mono">{user.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone Number",
      render: (user) => (
        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
          {formatPhone(user.phone)}
        </span>
      ),
    },
    {
      key: "role",
      header: "Platform Role",
      render: (user) => <UserRoleBadge role={user.role} />,
    },
    {
      key: "isBlocked",
      header: "Account Status",
      render: (user) => <StatusBadge type="userStatus" value={user.isBlocked} />,
    },
    {
      key: "noShowCount",
      header: "No-Shows",
      align: "center",
      render: (user) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            user.noShowCount > 2
              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
              : user.noShowCount > 0
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
              : "text-slate-400"
          }`}
        >
          {user.noShowCount}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Registered",
      sortable: true,
      render: (user) => (
        <span className="text-xs text-slate-500">{formatDate(user.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (user) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link href={`/admin/users/${user.id}`}>
            <Button variant="ghost" size="icon" title="View Profile">
              <Eye className="w-4 h-4 text-slate-500 hover:text-slate-900" />
            </Button>
          </Link>
          {user.isBlocked ? (
            <Button
              variant="ghost"
              size="icon"
              title="Unblock User"
              onClick={() => setSelectedUserForUnblock(user)}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              <ShieldCheck className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              title="Block User"
              onClick={() => setSelectedUserForBlock(user)}
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
            <UsersIcon className="w-6 h-6 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              User Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage all registered clients, barbers, salon owners, and administrator accounts.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <SearchInput
          placeholder="Search by name or phone number..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          className="w-full sm:max-w-md"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <FilterDropdown
            label="Role"
            selectedValue={role}
            onChange={(val) => {
              setRole(val);
              setPage(1);
            }}
            options={[
              { value: "ALL", label: "All Roles" },
              { value: "CLIENT", label: "Clients" },
              { value: "BARBER", label: "Barbers" },
              { value: "OWNER", label: "Salon Owners" },
              { value: "ADMIN", label: "Admins" },
            ]}
          />
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        onRetry={refetch}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search query or role filter."
        pagination={{
          currentPage: page,
          totalItems: data?.total || 0,
          pageSize: 20,
          onPageChange: setPage,
        }}
      />

      {/* Block User Modal */}
      {selectedUserForBlock && (
        <BlockUserModal
          isOpen={!!selectedUserForBlock}
          onClose={() => setSelectedUserForBlock(null)}
          userId={selectedUserForBlock.id}
          userName={`${selectedUserForBlock.firstName || ""} ${selectedUserForBlock.lastName || ""}`.trim() || selectedUserForBlock.phone}
        />
      )}

      {/* Unblock User Modal */}
      {selectedUserForUnblock && (
        <UnblockUserModal
          isOpen={!!selectedUserForUnblock}
          onClose={() => setSelectedUserForUnblock(null)}
          userId={selectedUserForUnblock.id}
          userName={`${selectedUserForUnblock.firstName || ""} ${selectedUserForUnblock.lastName || ""}`.trim() || selectedUserForUnblock.phone}
        />
      )}
    </AdminLayout>
  );
}

export default UsersPage;

