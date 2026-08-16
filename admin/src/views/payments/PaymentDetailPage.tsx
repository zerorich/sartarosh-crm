"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { PaymentStatusBadge } from "@/entities/payment/ui/PaymentStatusBadge";
import { usePaymentQuery, useRefundPaymentMutation } from "@/entities/payment/api/payment.queries";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DetailSkeleton } from "@/shared/ui/LoadingSkeleton";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useToast } from "@/shared/hooks/useToast";
import {
  formatCurrency,
  formatDateTime,
  formatPhone,
} from "@/shared/lib/utils";
import {
  ArrowLeft,
  CreditCard,
  Building2,
  User,
  CalendarCheck,
  RotateCcw,
  ShieldCheck,
  FileCheck,
  AlertCircle,
} from "lucide-react";

export function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: payment, isLoading, isError, error, refetch } = usePaymentQuery(id);
  const { mutateAsync: refundPayment, isPending: isRefunding } = useRefundPaymentMutation();
  const { success, error: showError } = useToast();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  if (isLoading) {
    return (
      <AdminLayout>
        <DetailSkeleton />
      </AdminLayout>
    );
  }

  if (isError || !payment) {
    return (
      <AdminLayout>
        <ErrorState
          title="Payment not found"
          message={error?.message || "Could not retrieve payment transaction details."}
          onRetry={refetch}
        />
      </AdminLayout>
    );
  }

  const handleRefundConfirm = async () => {
    try {
      await refundPayment({
        paymentId: payment.id,
        reason: refundReason || "Administrator issued customer refund",
      });
      success("Payment Refunded", `Transaction #${payment.id} has been marked as refunded.`);
      setIsConfirmOpen(false);
      refetch();
    } catch (err: any) {
      showError("Refund Failed", err?.message || "Failed to process payment refund.");
    }
  };

  const isRefundable = payment.status === "PAID";

  return (
    <AdminLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/payments")}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Payments
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Transaction #{payment.id}
              </h1>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Logged on {formatDateTime(payment.createdAt)}
            </p>
          </div>
        </div>

        {isRefundable && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Issue Full Refund
          </Button>
        )}
      </div>

      {/* Refund Notice if refunded */}
      {payment.status === "REFUNDED" && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 shadow-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Transaction Refunded
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              Reason: {payment.refundReason || "Issued by administrator."}
              {payment.refundedAt && ` (Processed: ${formatDateTime(payment.refundedAt)})`}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Transaction Overview & Gateway Logs */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Transaction Overview</span>
                </div>
              }
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Gross Amount</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Payment Method & Type</span>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white">
                      {payment.method}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {payment.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gateway Details */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                  <span>Gateway Verification</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Provider Reference:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {payment.providerRef || "None (Cash settlement)"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Verified Signature:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400 truncate block">
                      {payment.signature || "SHA256_VERIFIED"}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right 1 Col: Linked Booking & Client Profile */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-indigo-600" />
                  <span>Linked Appointment</span>
                </div>
              }
            />
            <CardBody className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block">Booking Reference:</span>
                <Link
                  href={`/admin/bookings/${payment.bookingId}`}
                  className="font-mono font-bold text-sm text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
                >
                  #{payment.bookingId}
                </Link>
              </div>

              {payment.booking && (
                <>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{payment.booking.salon.name}</span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{payment.booking.salon.address}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>
                        {payment.booking.client.firstName || payment.booking.client.lastName
                          ? `${payment.booking.client.firstName || ""} ${payment.booking.client.lastName || ""}`.trim()
                          : "Client"}
                      </span>
                    </div>
                    <p className="text-slate-400 font-mono mt-0.5">
                      {formatPhone(payment.booking.client.phone)}
                    </p>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog for Refund */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleRefundConfirm}
        title="Are you sure you want to refund this payment?"
        description={`This action will reverse the transaction of ${formatCurrency(payment.amount)} back to the customer. This action cannot be easily undone.`}
        confirmText="Confirm Refund"
        cancelText="Cancel"
        variant="danger"
        isLoading={isRefunding}
      >
        <div className="pt-2">
          <Input
            label="Refund Reason / Audit Note"
            placeholder="e.g., Service cancellation / customer dispute"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
          />
        </div>
      </ConfirmDialog>
    </AdminLayout>
  );
}

export default PaymentDetailPage;
