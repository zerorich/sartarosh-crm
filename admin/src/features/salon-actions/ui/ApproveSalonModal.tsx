"use client";

import React from "react";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useApproveSalonMutation } from "@/entities/salon/api/salon.queries";
import { useToast } from "@/shared/hooks/useToast";

export interface ApproveSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
  salonName: string;
}

export function ApproveSalonModal({
  isOpen,
  onClose,
  salonId,
  salonName,
}: ApproveSalonModalProps) {
  const { mutateAsync: approveSalon, isPending } = useApproveSalonMutation();
  const { success, error } = useToast();

  const handleApprove = async () => {
    try {
      await approveSalon(salonId);
      success("Salon Approved", `${salonName} is now live and accepting client bookings.`);
      onClose();
    } catch (err: any) {
      error("Action failed", err.message || "Could not approve salon.");
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleApprove}
      title="Approve Salon"
      description={`Are you sure you want to approve "${salonName}"? This will make the salon visible on the CutZone customer discovery map and enable online booking.`}
      confirmText="Approve Salon"
      variant="primary"
      isLoading={isPending}
    />
  );
}
