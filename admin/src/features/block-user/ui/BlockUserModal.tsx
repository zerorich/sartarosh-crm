"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { useBlockUserMutation } from "@/entities/user/api/user.queries";
import { useToast } from "@/shared/hooks/useToast";
import { AlertTriangle } from "lucide-react";

export interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function BlockUserModal({
  isOpen,
  onClose,
  userId,
  userName,
}: BlockUserModalProps) {
  const [reason, setReason] = useState("");
  const { mutateAsync: blockUser, isPending } = useBlockUserMutation();
  const { success, error } = useToast();

  const handleBlock = async () => {
    try {
      await blockUser({ userId, reason: reason.trim() || undefined });
      success("User blocked", `${userName} has been successfully restricted.`);
      onClose();
      setReason("");
    } catch (err: any) {
      error("Action failed", err.message || "Could not block user.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Block User"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleBlock} isLoading={isPending}>
            Block User
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            Blocking <strong className="font-semibold">{userName}</strong> will prevent them from making bookings, creating salons, or accessing platform features.
          </p>
        </div>

        <Input
          label="Reason for blocking (optional)"
          placeholder="e.g. Terms of service violation, repeated no-shows..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
    </Modal>
  );
}
