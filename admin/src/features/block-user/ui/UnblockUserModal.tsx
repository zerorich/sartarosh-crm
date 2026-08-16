"use client";

import React from "react";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useUnblockUserMutation } from "@/entities/user/api/user.queries";
import { useToast } from "@/shared/hooks/useToast";

export interface UnblockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function UnblockUserModal({
  isOpen,
  onClose,
  userId,
  userName,
}: UnblockUserModalProps) {
  const { mutateAsync: unblockUser, isPending } = useUnblockUserMutation();
  const { success, error } = useToast();

  const handleUnblock = async () => {
    try {
      await unblockUser(userId);
      success("User unblocked", `${userName} has been successfully restored.`);
      onClose();
    } catch (err: any) {
      error("Action failed", err.message || "Could not unblock user.");
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleUnblock}
      title="Unblock User"
      description={`Are you sure you want to restore full access for ${userName}? They will be allowed to use all platform services again.`}
      confirmText="Unblock User"
      variant="primary"
      isLoading={isPending}
    />
  );
}
