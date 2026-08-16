import { Avatar } from "@/components/ui/Avatar";
import { RatingStars } from "@/components/ui/RatingStars";
import { formatDate, fullName } from "@/lib/utils";
import type { Review } from "@/types/review";

export function ReviewCard({ review }: { review: Review }) {
  const overall = (review.barberRating + review.salonRating + review.serviceRating) / 3;

  return (
    <div className="flex gap-3 border-b border-border py-4 last:border-none">
      <Avatar user={review.client} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">{fullName(review.client) || "Mijoz"}</p>
          <span className="shrink-0 text-xs text-muted">{formatDate(review.createdAt)}</span>
        </div>
        <RatingStars value={overall} size={14} />
        {review.comment && <p className="mt-1.5 text-sm text-foreground/90">{review.comment}</p>}
      </div>
    </div>
  );
}
