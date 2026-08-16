"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/widgets/admin-layout/AdminLayout";
import { DataTable, Column } from "@/shared/ui/DataTable";
import { ReviewStars } from "@/entities/review/ui/ReviewStars";
import { ReviewModerationActions } from "@/features/review-moderation/ui/ReviewModerationActions";
import { Review } from "@/entities/review/model/types";
import { useReviewsQuery } from "@/entities/review/api/review.queries";
import { formatDate } from "@/shared/lib/utils";
import { Star, Building2, Scissors } from "lucide-react";

export function ReviewsPage() {
  const [includeHidden, setIncludeHidden] = useState(true);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useReviewsQuery({
    page,
    limit: 20,
    includeHidden,
  });

  const columns: Column<Review>[] = [
    {
      key: "client",
      header: "Customer",
      render: (r) => (
        <span className="font-bold text-xs text-slate-900 dark:text-white">
          {r.client.firstName || r.client.lastName
            ? `${r.client.firstName || ""} ${r.client.lastName || ""}`.trim()
            : "Client"}
        </span>
      ),
    },
    {
      key: "salon",
      header: "Salon & Barber",
      render: (r) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{r.salon.name}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Scissors className="w-3 h-3 text-slate-400" />
            <span>{r.barber.user.firstName} {r.barber.user.lastName}</span>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating Breakdown",
      render: (r) => (
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-12">Barber:</span>
            <ReviewStars rating={r.barberRating} size="xs" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-12">Salon:</span>
            <ReviewStars rating={r.salonRating} size="xs" />
          </div>
        </div>
      ),
    },
    {
      key: "comment",
      header: "Customer Feedback / Comment",
      render: (r) => (
        <div className="max-w-md text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
          &quot;{r.comment || "No written review text."}&quot;
        </div>
      ),
    },
    {
      key: "status",
      header: "Visibility",
      render: (r) =>
        r.isHidden ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            Hidden
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            Public
          </span>
        ),
    },
    {
      key: "createdAt",
      header: "Posted Date",
      sortable: true,
      render: (r) => (
        <span className="text-xs text-slate-500">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Moderation",
      align: "right",
      render: (r) => (
        <div className="flex justify-end">
          <ReviewModerationActions reviewId={r.id} isHidden={r.isHidden} />
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reviews & Moderation
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit customer reviews, inspect ratings, and moderate inappropriate or abusive content.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        error={error as Error}
        onRetry={refetch}
        emptyTitle="No reviews found"
        emptyDescription="There are currently no reviews on record."
        pagination={{
          currentPage: page,
          totalItems: data?.total || 0,
          pageSize: 20,
          onPageChange: setPage,
        }}
      />
    </AdminLayout>
  );
}

export default ReviewsPage;

