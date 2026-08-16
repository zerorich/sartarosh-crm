"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReviewCard } from "@/components/review/ReviewCard";
import { useBarber, useBarberReviews } from "@/hooks/queries";
import { formatMoney, fullName } from "@/lib/utils";
import { MessageSquareOff } from "lucide-react";

export function BarberDetailView({ barberId }: { barberId: string }) {
  const barber = useBarber(barberId);
  const reviews = useBarberReviews(barberId);

  if (barber.isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (barber.error || !barber.data) {
    return <ErrorState error={barber.error} onRetry={() => barber.refetch()} title="Sartarosh topilmadi" />;
  }

  const b = barber.data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-4">
        <Avatar user={b.user} size={72} />
        <div>
          <h1 className="text-xl font-bold">{fullName(b.user) || "Sartarosh"}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Star className="size-4 fill-warning text-warning" aria-hidden />
            <span className="font-medium text-foreground">{b.rating.toFixed(1)}</span>
            <span>({b.reviewCount} sharh)</span>
          </div>
        </div>
      </div>

      {b.bio && <p className="mt-4 text-sm text-foreground/90">{b.bio}</p>}

      {b.staffAssignments.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold">Ishlaydigan salonlar</h2>
          <div className="flex flex-col gap-2">
            {b.staffAssignments.map((a) => (
              <Link
                key={a.id}
                href={`/salons/${a.salon.id}`}
                className="rounded-xl border border-border p-3 text-sm hover:bg-surface-muted"
              >
                <p className="font-medium">{a.salon.name}</p>
                <p className="text-xs text-muted">{a.salon.city ? `${a.salon.city}, ${a.salon.address}` : a.salon.address}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {b.services.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold">Xizmatlar</h2>
          <div className="flex flex-col gap-2">
            {b.services.map((svc) => (
              <div key={svc.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                <span>{svc.name}</span>
                <span className="font-semibold">{formatMoney(svc.price)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold">Sharhlar</h2>
        {reviews.isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : reviews.data && reviews.data.items.length > 0 ? (
          <div>
            {reviews.data.items.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <EmptyState icon={MessageSquareOff} title="Hozircha sharhlar yo'q" />
        )}
      </section>
    </div>
  );
}
