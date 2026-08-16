"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/shared/constants/navigation";
import { cn } from "@/shared/lib/utils";
import { Scissors, ShieldCheck, Sparkles } from "lucide-react";

export interface AdminSidebarProps {
  className?: string;
  onLinkClick?: () => void;
}

export function AdminSidebar({ className, onLinkClick }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col w-64 bg-slate-900 text-slate-300 h-full border-r border-slate-800 select-none",
        className
      )}
    >
      {/* Brand Logo Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
          <Scissors className="w-5 h-5 -rotate-45" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-white">CutZone</span>
            <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Admin
            </span>
          </div>
          <p className="text-[10px] text-slate-400 -mt-0.5">Enterprise Core</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3.5 py-4 overflow-y-auto space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Main Menu
        </div>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive = pathname
            ? item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)
            : false;

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-600/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-slate-800 text-slate-300"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Pro Card / System Status */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Production Live</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            All microservices running optimal with 99.98% uptime.
          </p>
        </div>
      </div>
    </aside>
  );
}
