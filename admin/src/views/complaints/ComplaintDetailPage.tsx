"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { Card, CardHeader, CardBody, CardFooter } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { ComplaintStatusBadge } from "@/entities/complaint/ui/ComplaintStatusBadge";
import { useComplaintDetailQuery, useUpdateComplaintMutation } from "@/entities/complaint/api/complaint.queries";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DetailSkeleton } from "@/shared/ui/LoadingSkeleton";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useToast } from "@/shared/hooks/useToast";
import { formatDate, formatDateTime, formatPhone } from "@/shared/lib/utils";
import {
  ArrowLeft,
  AlertTriangle,
  Building2,
  User,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export function ComplaintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: complaint, isLoading, isError, error, refetch } = useComplaintDetailQuery(id);
  const { mutateAsync: updateComplaint, isPending } = useUpdateComplaintMutation();
  const { success, error: showError } = useToast();

  const [adminNote, setAdminNote] = useState("");
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);

  // Sync adminNote when complaint is loaded
  React.useEffect(() => {
    if (complaint?.adminNote) {
      setAdminNote(complaint.adminNote);
    }
  }, [complaint]);

  if (isLoading) {
    return (
      <AdminLayout>
        <DetailSkeleton />
      </AdminLayout>
    );
  }

  if (isError || !complaint) {
    return (
      <AdminLayout>
        <ErrorState
          title="Complaint not found"
          message={error?.message || "Could not retrieve customer complaint details."}
          onRetry={refetch}
        />
      </AdminLayout>
    );
  }

  const handleStatusChange = async (newStatus: "IN_REVIEW" | "RESOLVED" | "REJECTED") => {
    try {
      await updateComplaint({
        complaintId: complaint.id,
        data: {
          status: newStatus,
          adminNote: adminNote || undefined,
        },
      });
      success("Complaint Updated", `Status updated to ${newStatus.replace("_", " ")}.`);
      if (newStatus === "REJECTED") setIsRejectConfirmOpen(false);
      refetch();
    } catch (err: any) {
      showError("Update Failed", err?.message || "Failed to update complaint resolution.");
    }
  };

  return (
    <AdminLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/complaints")}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Complaints
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Dispute #{complaint.id}
              </h1>
              <ComplaintStatusBadge status={complaint.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Filed on {formatDateTime(complaint.createdAt)}
            </p>
          </div>
        </div>

        {/* Quick Status Action Controls */}
        <div className="flex items-center gap-2">
          {complaint.status === "OPEN" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange("IN_REVIEW")}
              isLoading={isPending}
              leftIcon={<Clock className="w-4 h-4 text-amber-500" />}
            >
              Start Review
            </Button>
          )}

          {complaint.status !== "RESOLVED" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStatusChange("RESOLVED")}
              isLoading={isPending}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Resolve Dispute
            </Button>
          )}

          {complaint.status !== "REJECTED" && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsRejectConfirmOpen(true)}
              isLoading={isPending}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Reject
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Complaint Subject, Description & Resolution Note Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Body */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Complaint Subject & Statement</span>
                </div>
              }
              subtitle="Category: General Dispute"
            />
            <CardBody className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {complaint.subject}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {complaint.body}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Admin Resolution Note */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  <span>Administrator Resolution Note</span>
                </div>
              }
              subtitle="Document findings, actions taken (e.g. issued compensation coupon, contacted salon), and final ruling."
            />
            <CardBody className="space-y-4">
              <textarea
                className="w-full min-h-[120px] p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition"
                placeholder="Write resolution notes, reason for compensation, or policy citations..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </CardBody>
            <CardFooter className="justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleStatusChange(complaint.status as "IN_REVIEW" | "RESOLVED" | "REJECTED")
                }
                isLoading={isPending}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Save Resolution Note
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right 1 Col: Complainant & Involved Entities */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-sky-600" />
                  <span>Complainant Details</span>
                </div>
              }
            />
            <CardBody className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                  {complaint.client.firstName?.[0] || "C"}
                </div>
                <div>
                  <Link
                    href={`/admin/users/${complaint.clientId}`}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-rose-600 transition-colors"
                  >
                    {complaint.client.firstName || complaint.client.lastName
                      ? `${complaint.client.firstName || ""} ${complaint.client.lastName || ""}`.trim()
                      : "Client"}
                  </Link>
                  <p className="font-mono text-slate-400 mt-0.5">
                    {formatPhone(complaint.client.phone)}
                  </p>
                </div>
              </div>

              {complaint.salon && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Salon</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{complaint.salon.name}</span>
                  </div>
                  {complaint.salon.address && (
                    <p className="text-slate-400 text-[11px]">{complaint.salon.address}</p>
                  )}
                </div>
              )}

              {complaint.bookingId && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Related Booking</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                    <CalendarCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <Link
                      href={`/admin/bookings/${complaint.bookingId}`}
                      className="hover:text-rose-600 transition-colors"
                    >
                      #{complaint.bookingId}
                    </Link>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isRejectConfirmOpen}
        onClose={() => setIsRejectConfirmOpen(false)}
        onConfirm={() => handleStatusChange("REJECTED")}
        title="Are you sure you want to reject this complaint?"
        description="Rejecting this dispute indicates the claim does not violate platform rules or lacks sufficient merit. The customer will be notified."
        confirmText="Reject Complaint"
        cancelText="Cancel"
        variant="danger"
        isLoading={isPending}
      />
    </AdminLayout>
  );
}

export default ComplaintDetailPage;
