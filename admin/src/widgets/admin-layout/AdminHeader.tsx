"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ExternalLink,
  Shield,
} from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { useToast } from "@/shared/hooks/useToast";

export interface AdminHeaderProps {
  onMobileMenuToggle: () => void;
}

export function AdminHeader({ onMobileMenuToggle }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { info } = useToast();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    info("Signed out", "You have been logged out of the CutZone Admin Panel.");
    setIsProfileOpen(false);
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left side: Hamburger on mobile + Global search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Quick search across CutZone (users, salons, bookings)..."
            className="w-full bg-slate-100/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs rounded-xl border border-transparent focus:border-slate-300 dark:focus:border-slate-700 pl-10 pr-12 py-2 transition-all focus:outline-none focus:bg-white dark:focus:bg-slate-900"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600 shadow-sm pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: Notifications + Admin Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-dropdown border border-slate-200 dark:border-slate-800 py-3 z-40 animate-in fade-in zoom-in-95">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  Notifications (2 unread)
                </span>
                <span className="text-[10px] text-rose-500 font-semibold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-64 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                    <span>New Salon Application</span>
                    <span className="text-[10px] text-slate-400">10m ago</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    &quot;StyleMen Premium Barbershop&quot; submitted registration documents for review.
                  </p>
                </div>
                <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-100">
                    <span>Customer Complaint Filed</span>
                    <span className="text-[10px] text-slate-400">1h ago</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Aziz Nematov reported a 35-minute barber delay at Grand Razor Club.
                  </p>
                </div>
              </div>
              <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  href="/admin/complaints"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View all in Complaints &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <UserAvatar
              firstName="Javodbek"
              lastName="Ergashev"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              size="sm"
              statusDot="online"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Javodbek Ergashev
              </p>
              <p className="text-[10px] font-medium text-slate-400">Super Administrator</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-dropdown border border-slate-200 dark:border-slate-800 py-1.5 z-40 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Signed in as</p>
                <p className="text-xs text-slate-500 truncate">+998 90 123 45 67</p>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/users/usr-001"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Admin Profile</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Platform Settings</span>
                </Link>

                <Link
                  href="/admin/reports"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Security & Audit</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
