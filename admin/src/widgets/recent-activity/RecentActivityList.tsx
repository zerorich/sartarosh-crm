"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardBody } from "@/shared/ui/Card";
import { Tabs } from "@/shared/ui/Tabs";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { formatRelativeDate } from "@/shared/lib/utils";
import {
  CalendarCheck,
  Building2,
  UserPlus,
  AlertTriangle,
  Star,
  ArrowRight,
} from "lucide-react";

export interface ActivityItem {
  id: string;
  type: "booking" | "salon" | "user" | "complaint" | "review";
  title: string;
  subtitle: string;
  timestamp: string;
  badge?: {
    type: "booking" | "salon" | "role" | "complaint";
    value: string;
  };
  link: string;
}

const mockRecentActivity: ActivityItem[] = [
  {
    id: "act-1",
    type: "booking",
    title: "Aziz Nematov booked 'Classic Fade & Styling'",
    subtitle: "At The Barber Lounge with Sardor Karimov (120,000 UZS)",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    badge: { type: "booking", value: "CONFIRMED" },
    link: "/admin/bookings",
  },
  {
    id: "act-2",
    type: "salon",
    title: "New Salon Registration: StyleMen Premium",
    subtitle: "Submitted by Bakhtiyor Tursunov (Shayxontohur)",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    badge: { type: "salon", value: "PENDING" },
    link: "/admin/salons/sal-004",
  },
  {
    id: "act-3",
    type: "complaint",
    title: "Customer Complaint: Barber 35 min delay",
    subtitle: "Aziz Nematov filed an issue against Grand Razor Club",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    badge: { type: "complaint", value: "OPEN" },
    link: "/admin/complaints",
  },
  {
    id: "act-4",
    type: "review",
    title: "5-Star Review for Jasur Aliyev",
    subtitle: "Davron Saidov: 'Eng zo'r sartaroshxona! Jasur aka o'z ishini ustasi.'",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    link: "/admin/reviews",
  },
  {
    id: "act-5",
    type: "user",
    title: "New Barber Onboarded: Shavkat Rahimov",
    subtitle: "Joined Barber City IT Park (Rating: 4.9)",
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    badge: { type: "role", value: "BARBER" },
    link: "/admin/barbers/brb-003",
  },
];

export function RecentActivityList({ activities = mockRecentActivity }: { activities?: ActivityItem[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All Activity" },
    { id: "booking", label: "Bookings" },
    { id: "salon", label: "Salons" },
    { id: "complaint", label: "Complaints" },
  ];

  const filtered =
    activeTab === "all"
      ? activities
      : activities.filter((a) => a.type === activeTab);

  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "booking":
        return <CalendarCheck className="w-4 h-4 text-emerald-600" />;
      case "salon":
        return <Building2 className="w-4 h-4 text-sky-600" />;
      case "user":
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case "complaint":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "review":
        return <Star className="w-4 h-4 text-amber-500 fill-amber-400" />;
    }
  };

  const getIconBg = (type: ActivityItem["type"]) => {
    switch (type) {
      case "booking":
        return "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800";
      case "salon":
        return "bg-sky-50 dark:bg-sky-950/50 border-sky-200/80 dark:border-sky-800";
      case "user":
        return "bg-purple-50 dark:bg-purple-950/50 border-purple-200/80 dark:border-purple-800";
      case "complaint":
        return "bg-rose-50 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-800";
      case "review":
        return "bg-amber-50 dark:bg-amber-950/50 border-amber-200/80 dark:border-amber-800";
    }
  };

  return (
    <Card>
      <CardHeader
        title="Live Platform Activity Feed"
        subtitle="Real-time events across client bookings, salon approvals, and moderation"
        action={<Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />}
      />
      <CardBody className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${getIconBg(
                    item.type
                  )}`}
                >
                  {getIcon(item.type)}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-4">
                {item.badge && (
                  <StatusBadge
                    type={item.badge.type}
                    value={item.badge.value}
                    className="hidden sm:inline-flex"
                  />
                )}
                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                  {formatRelativeDate(item.timestamp)}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
