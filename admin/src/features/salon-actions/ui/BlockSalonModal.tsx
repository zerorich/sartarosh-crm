"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { useBlockSalonMutation } from "@/entities/salon/api/salon.queries";
import { useToast } from "@/shared/hooks/useToast";
import { AlertTriangle } from "lucide-react";

export interface BlockSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
  salonName: string;
}

export function BlockSalonModal({
  isOpen,
  onClose,
  salonId,
  salonName,
}: BlockSalonModalProps) {
  const [reason, setReason] = useState("");
  const { mutateAsync: blockSalon, isPending } = useBlockSalonMutation();
  const { success, error } = useToast();

  const handleBlock = async () => {
    try {
      await blockSalon({ salonId, reason: reason.trim() || undefined });
      success("Salon Blocked", `"${salonName}" has been suspended from the CutZone platform.`);
      onClose();
      setReason("");
    } catch (err: any) {
      error("Action failed", err.message || "Could not block salon.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Block / Suspend Salon"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBlock} isLoading={isPending}>
            Block Salon
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            Blocking <strong className="font-semibold">{salonName}</strong> will immediately disable bookings for all barbers affiliated with this salon.
          </p>
        </div>

        <Input
          label="Reason for blocking (optional)"
          placeholder="e.g. Safety violations, customer fraud reports..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Modal>
  );
}
