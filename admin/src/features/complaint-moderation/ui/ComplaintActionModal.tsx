"use client";

import React, { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Select";
import { Input } from "@/shared/ui/Input";
import { Complaint, ComplaintStatus } from "@/entities/complaint/model/types";
import { useUpdateComplaintMutation } from "@/entities/complaint/api/complaint.queries";
import { useToast } from "@/shared/hooks/useToast";

export interface ComplaintActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: Complaint;
}

export function ComplaintActionModal({
  isOpen,
  onClose,
  complaint,
}: ComplaintActionModalProps) {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [adminNote, setAdminNote] = useState(complaint.adminNote || "");
  const { mutateAsync: updateComplaint, isPending } = useUpdateComplaintMutation();
  const { success, error } = useToast();

  const handleSave = async () => {
    try {
      await updateComplaint({
        complaintId: complaint.id,
        data: {
          status,
          adminNote: adminNote.trim() || undefined,
        },
      });
      success("Complaint Updated", `Status changed to ${status}.`);
      onClose();
    } catch (err: any) {
      error("Action failed", err.message || "Could not update complaint.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve / Update Complaint"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={isPending}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1.5 border border-slate-200/80 dark:border-slate-700/80">
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{complaint.subject}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{complaint.body}</p>
        </div>

        <Select
          label="Complaint Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
          options={[
            { value: "OPEN", label: "Open (Pending)" },
            { value: "IN_REVIEW", label: "In Review" },
            { value: "RESOLVED", label: "Resolved" },
            { value: "REJECTED", label: "Rejected" },
          ]}
        />

        <Input
          label="Resolution / Admin Note"
          placeholder="e.g. Refund processed, barber warned, coupon issued..."
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
        />
      </div>
    </Modal>
  );
}
