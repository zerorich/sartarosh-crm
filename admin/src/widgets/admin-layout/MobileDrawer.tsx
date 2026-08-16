"use client";

import React, { useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { X } from "lucide-react";

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-64 max-w-[80vw] h-full bg-slate-900 shadow-2xl z-10 flex flex-col transform transition-transform animate-in slide-in-from-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-3 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80 z-20 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        <AdminSidebar onLinkClick={onClose} className="w-full h-full border-none" />
      </div>
    </div>
  );
}
