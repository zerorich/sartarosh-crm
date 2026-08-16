"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { MobileDrawer } from "./MobileDrawer";
import {
  getAccessToken,
  getSessionUser,
  isAdminRole,
  type AdminUser,
} from "@/shared/lib/session";

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<"checking" | "authenticated">(
    "checking"
  );
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    const user = getSessionUser();

    if (!token || !user || !isAdminRole(user.role)) {
      router.replace("/login");
      return;
    }

    setCurrentUser(user);
    setAuthState("authenticated");
  }, [router]);

  if (authState === "checking" || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex antialiased">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Canvas */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        <AdminHeader
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
          currentUser={currentUser}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
