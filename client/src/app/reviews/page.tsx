"use client";

import { useRouter } from "next/navigation";
import { MessageSquareText, UserRound } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ListRowSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/ui/RatingStars";
import { useMyReviews } from "@/hooks/queries";
import { useAuth } from "@/hooks/useAuth";
import { formatDate, fullName } from "@/lib/utils";

export default function MyReviewsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const reviews = useMyReviews();

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <EmptyState
          icon={UserRound}
          title="Sharhlaringizni ko'rish uchun kiring"
          action={<Button onClick={() => router.push("/login?redirect=/reviews")}>Kirish</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Sharhlarim</h1>

      {reviews.isLoading ? (
        <div className="flex flex-col gap-2">
          <ListRowSkeleton />
          <ListRowSkeleton />
        </div>
      ) : reviews.error ? (
        <ErrorState error={reviews.error} onRetry={() => reviews.refetch()} />
      ) : !reviews.data || reviews.data.length === 0 ? (
        <EmptyState icon={MessageSquareText} title="Hali sharh qoldirmagansiz" />
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.data.map((review) => {
            const overall = (review.barberRating + review.salonRating + review.serviceRating) / 3;
            return (
              <div key={review.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{review.salon.name}</p>
                    <p className="text-xs text-muted">
                      {review.service.name} · {fullName(review.barber.user)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">{formatDate(review.createdAt)}</span>
                </div>
                <RatingStars value={overall} size={14} />
                {review.comment && <p className="mt-1.5 text-sm text-foreground/90">{review.comment}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
