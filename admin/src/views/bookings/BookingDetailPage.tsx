"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { BookingStatusBadge } from "@/entities/booking/ui/BookingStatusBadge";
import { useBookingQuery } from "@/entities/booking/api/booking.queries";
import { DetailSkeleton } from "@/shared/ui/LoadingSkeleton";
import { ErrorState } from "@/shared/ui/ErrorState";
import {
  formatCurrency,
  formatDateTime,
  formatEmail,
} from "@/shared/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Scissors,
  Building2,
  CreditCard,
  AlertCircle,
  Gift,
  CheckCircle2,
  Timer,
  FileText,
} from "lucide-react";

export function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: booking, isLoading, isError, error, refetch } = useBookingQuery(id);

  if (isLoading) {
    return (
      <AdminLayout>
        <DetailSkeleton />
      </AdminLayout>
    );
  }

  if (isError || !booking) {
    return (
      <AdminLayout>
        <ErrorState
          title="Booking not found"
          message={error?.message || "Could not retrieve appointment details."}
          onRetry={refetch}
        />
      </AdminLayout>
    );
  }

  const isDelayed = (booking.delayMinutes || 0) > 0;
  const compensationRate = booking.compensationPercent || (isDelayed ? 10 : 0);

  return (
    <AdminLayout>
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/bookings")}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Bookings
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Booking #{booking.id}
              </h1>
              <BookingStatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Created on {formatDateTime(booking.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Delay & Compensation Banner if delay occurred */}
      {isDelayed && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/30 border border-rose-200 dark:border-rose-900/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0 shadow-sm">
              <Timer className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <span>Barber Arrival Delayed by {booking.delayMinutes} minutes</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-600 text-white uppercase tracking-wider">
                  SLA Alert
                </span>
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Scheduled Start:{" "}
                <span className="font-semibold">{formatDateTime(booking.scheduledStartAt || booking.startAt)}</span> |
                Actual Start:{" "}
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {booking.actualStartAt ? formatDateTime(booking.actualStartAt) : "Pending check-in"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/80">
            <Gift className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Client Compensation</span>
              <p className="text-sm font-extrabold text-rose-600 font-mono">
                {compensationRate}% Discount Coupon Applied
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Client, Salon, Service & Schedule Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Timing & Schedule Comparison */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-600" />
                  <span>Appointment Schedule & SLA Audit</span>
                </div>
              }
              subtitle="Comparison between scheduled appointment time and verified barber check-in."
            />
            <CardBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-sky-500" />
                  <span>Scheduled Timeframe</span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Start:</strong>{" "}
                    {formatDateTime(booking.scheduledStartAt || booking.startAt)}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">End:</strong>{" "}
                    {formatDateTime(booking.scheduledEndAt || booking.endAt)}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <Timer className="w-4 h-4 text-emerald-500" />
                  <span>Actual Time Execution</span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Actual Start:</strong>{" "}
                    {booking.actualStartAt ? formatDateTime(booking.actualStartAt) : "Not started yet"}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white">Actual End:</strong>{" "}
                    {booking.actualEndAt ? formatDateTime(booking.actualEndAt) : "In progress / Pending"}
                  </p>
                  {isDelayed && (
                    <p className="text-rose-600 font-bold text-[11px] pt-1">
                      Delay: {booking.delayMinutes} minutes ({compensationRate}% compensation)
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Service & Salon Details */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-indigo-600" />
                  <span>Service & Salon Details</span>
                </div>
              }
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Salon</span>
                  </div>
                  <Link
                    href={`/admin/salons/${booking.salonId}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-rose-600 transition-colors block"
                  >
                    {booking.salon.name}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {booking.salon.address || "Tashkent City"}
                  </p>
                  {booking.salon.phone && (
                    <p className="text-xs font-mono text-slate-400">
                      {booking.salon.phone}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Barber</span>
                  </div>
                  <Link
                    href={`/admin/barbers/${booking.barberId}`}
                    className="text-sm font-bold text-slate-900 dark:text-white hover:text-rose-600 transition-colors block"
                  >
                    {booking.barber.user.firstName} {booking.barber.user.lastName}
                  </Link>
                  <p className="text-xs text-slate-500">
                    Assigned Master Stylist
                  </p>
                  {booking.barber.user.email && (
                    <p className="text-xs font-mono text-slate-400">
                      {formatEmail(booking.barber.user.email)}
                    </p>
                  )}
                </div>
              </div>

              {/* Service Info Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {booking.service.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Duration: {booking.service.durationMinutes || 45} minutes
                  </p>
                </div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(booking.price)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right 1 Column: Client Profile & Financial Breakdown */}
        <div className="space-y-6">
          {/* Client Card */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-sky-600" />
                  <span>Customer Profile</span>
                </div>
              }
            />
            <CardBody className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm">
                  {booking.client.firstName?.[0] || "C"}
                </div>
                <div>
                  <Link
                    href={`/admin/users/${booking.clientId}`}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
                  >
                    {booking.client.firstName || booking.client.lastName
                      ? `${booking.client.firstName || ""} ${booking.client.lastName || ""}`.trim()
                      : "Registered Client"}
                  </Link>
                  <p className="font-mono text-slate-400 mt-0.5">
                    {formatEmail(booking.client.email)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-500">
                <span>Client ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{booking.clientId}</span>
              </div>
            </CardBody>
          </Card>

          {/* Payment & Financial Ledger */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Payment Ledger</span>
                </div>
              }
              subtitle="Deposit and remaining balance breakdown"
            />
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Service Base Price</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(booking.price)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Deposit Paid (Online)
                </span>
                <span className="font-mono font-bold text-emerald-600">
                  {formatCurrency(booking.depositAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Remaining Balance (At Desk)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCurrency(booking.remainingAmount)}
                </span>
              </div>

              {booking.coupon && (
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800 text-rose-600">
                  <span className="font-semibold flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" /> Coupon ({booking.coupon.value}%)
                  </span>
                  <span className="font-mono font-bold">Applied</span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between mt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Settlement
                </span>
                <span className="text-base font-extrabold font-mono text-emerald-400">
                  {formatCurrency(booking.price)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default BookingDetailPage;
