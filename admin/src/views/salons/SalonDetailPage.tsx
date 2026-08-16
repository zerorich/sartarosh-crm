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
import { formatDate, formatCurrency, formatPhone } from "@/shared/lib/utils";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  ShieldBan,
  Users,
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
                    {formatPhone(salon.owner.user.phone)}
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

      {/* Services List Preview */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-indigo-500" />
              <span>Services Catalog</span>
            </div>
          }
          subtitle="All active grooming services offered at this salon location"
        />
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { name: "Classic Haircut & Styling", duration: 45, price: 120000 },
              { name: "Beard Trim & Hot Towel Treatment", duration: 30, price: 80000 },
              { name: "Royal Hair & Beard Grooming Package", duration: 75, price: 220000 },
              { name: "Kids Haircut (under 12)", duration: 30, price: 70000 },
            ].map((srv, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 px-6 text-xs sm:text-sm">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{srv.name}</p>
                  <p className="text-xs text-slate-400">{srv.duration} minutes</p>
                </div>
                <div className="text-right font-extrabold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(srv.price)}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Staff Barbers */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span>Affiliated Barbers</span>
            </div>
          }
          subtitle="Barbers currently working at this salon"
        />
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { id: "brb-001", name: "Sardor Karimov", phone: "998935552211", rating: 4.9, reviews: 128 },
              { id: "brb-002", name: "Jasur Aliyev", phone: "998971113344", rating: 4.8, reviews: 96 },
            ].map((barber) => (
              <div key={barber.id} className="flex items-center justify-between p-4 px-6">
                <div className="flex items-center gap-3">
                  <UserAvatar firstName={barber.name} size="sm" />
                  <div>
                    <Link
                      href={`/admin/barbers/${barber.id}`}
                      className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
                    >
                      {barber.name}
                    </Link>
                    <p className="text-xs text-slate-400 font-mono">{formatPhone(barber.phone)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <BarberRating rating={barber.rating} reviewCount={barber.reviews} />
                  <Link href={`/admin/barbers/${barber.id}`}>
                    <Button variant="outline" size="sm">
                      Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
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

