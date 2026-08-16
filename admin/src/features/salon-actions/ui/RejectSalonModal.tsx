"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { useRejectSalonMutation } from "@/entities/salon/api/salon.queries";
import { useToast } from "@/shared/hooks/useToast";
import { AlertCircle } from "lucide-react";

export interface RejectSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
  salonName: string;
}

export function RejectSalonModal({
  isOpen,
  onClose,
  salonId,
  salonName,
}: RejectSalonModalProps) {
  const [reason, setReason] = useState("");
  const { mutateAsync: rejectSalon, isPending } = useRejectSalonMutation();
  const { success, error } = useToast();

  const handleReject = async () => {
    if (!reason.trim()) {
      error("Reason required", "Please provide a reason for rejecting this salon registration.");
      return;
    }

    try {
      await rejectSalon({ salonId, reason: reason.trim() });
      success("Salon Rejected", `Registration for "${salonName}" was rejected.`);
      onClose();
      setReason("");
    } catch (err: any) {
      error("Action failed", err.message || "Could not reject salon.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reject Salon Registration"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject} isLoading={isPending}>
            Reject Salon
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            The salon owner will be notified with the reason provided below so they can adjust their details and re-apply.
          </p>
        </div>

        <Input
          label="Reason for rejection *"
          placeholder="e.g. Incomplete license documents, invalid address..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
      </div>
    </Modal>
  );
}
