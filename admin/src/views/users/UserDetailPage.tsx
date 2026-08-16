"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { UserRoleBadge } from "@/entities/user/ui/UserRoleBadge";
import { useUserDetailQuery } from "@/entities/user/api/user.queries";
import { BlockUserModal } from "@/features/block-user/ui/BlockUserModal";
import { UnblockUserModal } from "@/features/block-user/ui/UnblockUserModal";
import { DetailSkeleton } from "@/shared/ui/LoadingSkeleton";
import { ErrorState } from "@/shared/ui/ErrorState";
import { formatDate, formatDateTime, formatEmail } from "@/shared/lib/utils";
import {
  ArrowLeft,
  ShieldBan,
  ShieldCheck,
  Mail,
  Calendar,
  AlertTriangle,
  User as UserIcon,
  Star,
  Scissors,
  Building2,
} from "lucide-react";

export function UserDetailPage({ id }: { id: string }) {
  const { data: user, isLoading, isError, error, refetch } = useUserDetailQuery(id);
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [isUnblockOpen, setIsUnblockOpen] = useState(false);

  if (isLoading) {
    return (
      <AdminLayout>
        <DetailSkeleton />
      </AdminLayout>
    );
  }

  if (isError || !user) {
    return (
      <AdminLayout>
        <ErrorState
          title="User not found"
          message={error?.message || "Could not retrieve user profile."}
          onRetry={refetch}
        />
      </AdminLayout>
    );
  }

  const fullName =
    user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "Unnamed User";

  return (
    <AdminLayout>
      {/* Back button */}
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users List</span>
        </Link>
      </div>

      {/* User Header Profile Card */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <UserAvatar
              firstName={user.firstName}
              lastName={user.lastName}
              src={user.avatarUrl}
              size="xl"
              statusDot={user.isBlocked ? "blocked" : "online"}
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {fullName}
                </h1>
                <UserRoleBadge role={user.role} />
                <StatusBadge type="userStatus" value={user.isBlocked} />
              </div>
              <p className="text-xs text-slate-400 font-mono">User ID: {user.id}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {formatEmail(user.email)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.isBlocked ? (
              <Button
                variant="primary"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                onClick={() => setIsUnblockOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Unblock Account
              </Button>
            ) : (
              <Button
                variant="danger"
                leftIcon={<ShieldBan className="w-4 h-4" />}
                onClick={() => setIsBlockOpen(true)}
              >
                Block Account
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Block Alert Banner if Blocked */}
      {user.isBlocked && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-rose-900 dark:text-rose-200">
            <p className="font-bold">This account is currently blocked</p>
            <p>
              Blocked on: <strong>{formatDateTime(user.blockedAt)}</strong>. Reason:{" "}
              <em>{user.blockReason || "No specific reason provided."}</em>
            </p>
          </div>
        </div>
      )}

      {/* Profile Details & Associated Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Account Info */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-indigo-500" />
                <span>Account Information</span>
              </div>
            }
          />
          <CardBody className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">First Name</span>
              <span className="font-semibold">{user.firstName || "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Last Name</span>
              <span className="font-semibold">{user.lastName || "—"}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Email</span>
              <span className="font-semibold font-mono">{formatEmail(user.email)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Last Updated</span>
              <span className="font-semibold">{formatDate(user.updatedAt)}</span>
            </div>
          </CardBody>
        </Card>

        {/* Reliability & Penalty Stats */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Reliability & Policy</span>
              </div>
            }
          />
          <CardBody className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">No-Show Strikes</p>
                <p className="text-slate-500 text-[11px]">Unexcused missed appointments</p>
              </div>
              <span
                className={`text-lg font-black px-2.5 py-1 rounded-lg ${
                  user.noShowCount > 0
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {user.noShowCount}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Restricted Status</span>
              <span className="font-semibold">
                {user.restrictedUntil ? `Restricted until ${formatDate(user.restrictedUntil)}` : "None (Good standing)"}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Role Slices */}
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                {user.role === "BARBER" ? (
                  <Scissors className="w-4 h-4 text-purple-500" />
                ) : user.role === "OWNER" ? (
                  <Building2 className="w-4 h-4 text-amber-500" />
                ) : (
                  <UserIcon className="w-4 h-4 text-sky-500" />
                )}
                <span>Role Details</span>
              </div>
            }
          />
          <CardBody className="space-y-3 text-xs">
            {user.role === "BARBER" && user.barberProfile ? (
              <>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Average Rating</span>
                  <div className="flex items-center gap-1 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{user.barberProfile.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Total Reviews</span>
                  <span className="font-semibold">{user.barberProfile.reviewCount}</span>
                </div>
                <Link
                  href={`/admin/barbers`}
                  className="block pt-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  View Barber Profile &rarr;
                </Link>
              </>
            ) : user.role === "OWNER" ? (
              <>
                <p className="text-slate-500">
                  Registered salon owner. Manages business profile and staff.
                </p>
                <Link
                  href={`/admin/salons`}
                  className="block pt-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  View Owned Salons &rarr;
                </Link>
              </>
            ) : (
              <p className="text-slate-500">
                Standard client account. Can search salons and book appointments on CutZone.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Block & Unblock Modals */}
      <BlockUserModal
        isOpen={isBlockOpen}
        onClose={() => setIsBlockOpen(false)}
        userId={user.id}
        userName={fullName}
      />

      <UnblockUserModal
        isOpen={isUnblockOpen}
        onClose={() => setIsUnblockOpen(false)}
        userId={user.id}
        userName={fullName}
      />
    </AdminLayout>
  );
}

export default UserDetailPage;

