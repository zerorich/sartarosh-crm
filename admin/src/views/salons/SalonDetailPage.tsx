"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { SalonStatusBadge } from "@/entities/salon/ui/SalonStatusBadge";
import { BarberRating } from "@/entities/barber/ui/BarberRating";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { useSalonDetailQuery } from "@/entities/salon/api/salon.queries";
import { ApproveSalonModal } from "@/features/salon-actions/ui/ApproveSalonModal";
import { RejectSalonModal } from "@/features/salon-actions/ui/RejectSalonModal";
import { BlockSalonModal } from "@/features/salon-actions/ui/BlockSalonModal";
import { DetailSkeleton } from "@/shared/ui/LoadingSkeleton";
import { ErrorState } from "@/shared/ui/ErrorState";
import { formatDate, formatEmail } from "@/shared/lib/utils";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  ShieldBan,
  Scissors,
  DollarSign,
  AlertCircle,
} from "lucide-react";

export function SalonDetailPage({ id }: { id: string }) {
  const { data: salon, isLoading, isError, error, refetch } = useSalonDetailQuery(id);

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isBlockOpen, setIsBlockOpen] = useState(false);

  if (isLoading) {
    return (
      <AdminLayout>
        <DetailSkeleton />
      </AdminLayout>
    );
  }

  if (isError || !salon) {
    return (
      <AdminLayout>
        <ErrorState
          title="Salon not found"
          message={error?.message || "Could not retrieve salon details."}
          onRetry={refetch}
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Back button */}
      <div>
        <Link
          href="/admin/salons"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Salons Directory</span>
        </Link>
      </div>

      {/* Hero Cover & Salon Header */}
      <Card className="overflow-hidden bg-white dark:bg-slate-900">
        {/* Cover Photo */}
        <div className="h-56 sm:h-72 w-full relative bg-slate-800">
          {salon.coverUrl ? (
            <img
              src={salon.coverUrl}
              alt={salon.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <Building2 className="w-16 h-16" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Floating Status & Actions on Cover */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <SalonStatusBadge status={salon.status} />
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
                  Deposit: {salon.depositValue}%
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{salon.name}</h1>
              <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{salon.address}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {salon.status === "PENDING" && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => setIsApproveOpen(true)}
                  >
                    Approve Salon
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<XCircle className="w-4 h-4" />}
                    onClick={() => setIsRejectOpen(true)}
                  >
                    Reject
                  </Button>
                </>
              )}

              {salon.status === "ACTIVE" && (
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<ShieldBan className="w-4 h-4" />}
                  onClick={() => setIsBlockOpen(true)}
                >
                  Block Salon
                </Button>
              )}

              {(salon.status === "BLOCKED" || salon.status === "REJECTED") && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  onClick={() => setIsApproveOpen(true)}
                >
                  Re-Approve Salon
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Reject Notice if Rejected or Blocked */}
      {(salon.status === "REJECTED" || salon.status === "BLOCKED") && salon.rejectReason && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-rose-900 dark:text-rose-200">
            <p className="font-bold">Salon Notice / Rejection Reason</p>
            <p className="leading-relaxed">{salon.rejectReason}</p>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* About & Business Info */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="About the Salon"
            subtitle="Public description and contact information"
          />
          <CardBody className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              {salon.description || "No public description provided for this salon."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-slate-400">Direct Phone</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {salon.phone || "—"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Coordinates (GPS)</span>
                <p className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                  {salon.lat.toFixed(4)}, {salon.lng.toFixed(4)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Onboarding Date</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(salon.createdAt)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Average Rating</span>
                <div>
                  <BarberRating rating={salon.rating} reviewCount={salon.reviewCount} />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Owner Info Card */}
        <Card>
          <CardHeader
            title="Salon Owner Profile"
            subtitle="Registered business owner"
          />
          <CardBody className="space-y-4 text-xs">
            {salon.owner?.user ? (
              <div className="flex items-center gap-3">
                <UserAvatar
                  firstName={salon.owner.user.firstName}
                  lastName={salon.owner.user.lastName}
                  size="md"
                />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {salon.owner.user.firstName} {salon.owner.user.lastName}
                  </p>
                  <p className="text-slate-500 font-mono">
                    {formatEmail(salon.owner.user.email)}
                  </p>
                  <Link
                    href={`/admin/users/${salon.owner.user.id}`}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline block pt-1"
                  >
                    View Owner Account &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Owner information unavailable.</p>
            )}

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 border border-slate-100 dark:border-slate-700">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Deposit Policy
              </span>
              <p className="text-slate-500 text-[11px]">
                Clients pay <strong>{salon.depositValue}%</strong> online advance when booking.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Salon Activity Summary */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-indigo-500" />
              <span>Salon Activity Summary</span>
            </div>
          }
          subtitle="Aggregate counts of services, staff, bookings, and reviews for this location"
        />
        <CardBody className="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800">
            <div className="p-5 text-center space-y-1">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {salon._count?.services ?? "—"}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Services</p>
            </div>
            <div className="p-5 text-center space-y-1">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {salon._count?.staff ?? "—"}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Barbers</p>
            </div>
            <div className="p-5 text-center space-y-1">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {salon._count?.bookings ?? "—"}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Bookings</p>
            </div>
            <div className="p-5 text-center space-y-1">
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {salon._count?.reviews ?? "—"}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Reviews</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Modals */}
      <ApproveSalonModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        salonId={salon.id}
        salonName={salon.name}
      />

      <RejectSalonModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        salonId={salon.id}
        salonName={salon.name}
      />

      <BlockSalonModal
        isOpen={isBlockOpen}
        onClose={() => setIsBlockOpen(false)}
        salonId={salon.id}
        salonName={salon.name}
      />
    </AdminLayout>
  );
}

export default SalonDetailPage;

