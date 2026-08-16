"use client";

import React from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { BarberRating } from "@/entities/barber/ui/BarberRating";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { useBarberDetailQuery } from "@/entities/barber/api/barber.queries";
import { DetailSkeleton } from "@/shared/ui/LoadingSkeleton";
import { ErrorState } from "@/shared/ui/ErrorState";
import { formatDate, formatEmail, formatNumber } from "@/shared/lib/utils";
import {
  ArrowLeft,
  Scissors,
  Building2,
  Mail,
  Calendar,
  CreditCard,
  CalendarCheck,
  Star,
  Award,
} from "lucide-react";

export function BarberDetailPage({ id }: { id: string }) {
  const { data: barber, isLoading, isError, error, refetch } = useBarberDetailQuery(id);

  if (isLoading) {
    return (
      <AdminLayout>
        <DetailSkeleton />
      </AdminLayout>
    );
  }

  if (isError || !barber) {
    return (
      <AdminLayout>
        <ErrorState
          title="Barber not found"
          message={error?.message || "Could not retrieve barber profile."}
          onRetry={refetch}
        />
      </AdminLayout>
    );
  }

  const fullName =
    barber.user.firstName || barber.user.lastName
      ? `${barber.user.firstName || ""} ${barber.user.lastName || ""}`.trim()
      : "Barber Profile";

  return (
    <AdminLayout>
      {/* Back button */}
      <div>
        <Link
          href="/admin/barbers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Barbers List</span>
        </Link>
      </div>

      {/* Header Profile Card */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <UserAvatar
              firstName={barber.user.firstName}
              lastName={barber.user.lastName}
              src={barber.user.avatarUrl}
              size="xl"
              statusDot={barber.user.isBlocked ? "blocked" : "online"}
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {fullName}
                </h1>
                <StatusBadge type="userStatus" value={barber.user.isBlocked} />
              </div>
              <p className="text-xs text-slate-400 font-mono">Barber ID: {barber.id}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {formatEmail(barber.user.email)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Joined {formatDate(barber.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/admin/users/${barber.user.id}`}>
              <Button variant="secondary" size="sm">
                View User Account
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Customer Rating</span>
            <div className="flex items-center gap-2">
              <BarberRating rating={barber.rating} reviewCount={barber.reviewCount} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Completed</span>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(barber._count?.bookings || 0)} Bookings
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Reviews</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatNumber(barber._count?.reviews ?? barber.reviewCount ?? 0)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Barber Bio & Linked Salon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                <span>Professional Bio</span>
              </div>
            }
          />
          <CardBody className="text-xs space-y-3">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {barber.bio || "No professional biography provided."}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-500" />
                <span>Affiliated Salon Workspace</span>
              </div>
            }
          />
          <CardBody className="text-xs space-y-3">
            {barber.staffAssignments && barber.staffAssignments.length > 0 ? (
              barber.staffAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {assignment.salon.name}
                    </p>
                    <p className="text-slate-400 text-xs font-mono">Salon ID: {assignment.salon.id}</p>
                  </div>
                  <Link href={`/admin/salons/${assignment.salon.id}`}>
                    <Button variant="secondary" size="sm">
                      Salon Details &rarr;
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-slate-400">Independent / Freelance Barber</p>
            )}
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default BarberDetailPage;

