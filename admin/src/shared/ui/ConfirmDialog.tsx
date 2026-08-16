"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { cn } from "@/shared/lib/utils";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div
          className={cn(
            "w-11 h-11 rounded-xl shrink-0 flex items-center justify-center shadow-sm",
            isDanger
              ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
              : "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
          )}
        >
          {isDanger ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
        </div>
        <div className="space-y-2 flex-1">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
          {children}
        </div>
      </div>
    </Modal>
  );
}
