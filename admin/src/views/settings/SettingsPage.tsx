"use client";

import React from "react";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { SettingsForm } from "@/features/settings-form/ui/SettingsForm";
import { useAdminSettingsQuery } from "@/entities/setting/api/setting.queries";
import { DetailSkeleton } from "@/shared/ui/LoadingSkeleton";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Settings } from "lucide-react";

export function SettingsPage() {
  const { data: settings, isLoading, isError, error, refetch } = useAdminSettingsQuery();

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-800 dark:text-slate-200" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Platform Settings & Policies
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global rules for customer no-shows, barber delay compensation, search perimeters, and automated notifications.
          </p>
        </div>
      </div>

      {isLoading ? (
        <DetailSkeleton />
      ) : isError || !settings ? (
        <ErrorState
          title="Could not load platform settings"
          message={error?.message || "Failed to load parameters."}
          onRetry={refetch}
        />
      ) : (
        <SettingsForm settings={settings} />
      )}
    </AdminLayout>
  );
}

export default SettingsPage;

