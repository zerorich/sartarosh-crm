"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Navigation, Phone, Star } from "lucide-react";
import { yandexDirectionsUrl } from "@/lib/directions";
import { SalonCover } from "@/components/ui/SalonCover";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ReviewCard } from "@/components/review/ReviewCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSalon, useSalonBarbers, useSalonReviews, useSalonServices, useToggleSavedSalon, useSavedSalons } from "@/hooks/queries";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney } from "@/lib/utils";
import { MessageSquareOff, Heart } from "lucide-react";

const WEEKDAYS = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];

export function SalonDetailView({ salonId }: { salonId: string }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const salon = useSalon(salonId);
  const services = useSalonServices(salonId);
  const barbers = useSalonBarbers(salonId);
  const reviews = useSalonReviews(salonId);
  const { data: saved } = useSavedSalons();
  const toggleSaved = useToggleSavedSalon();
  const isSaved = (saved ?? []).some((s) => s.id === salonId);

  if (salon.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-6 w-1/2" />
        <Skeleton className="mt-2 h-4 w-1/3" />
      </div>
    );
  }

  if (salon.error || !salon.data) {
    return <ErrorState error={salon.error} onRetry={() => salon.refetch()} title="Salon topilmadi" />;
  }

  const s = salon.data;
  const startingPrice = services.data?.filter((svc) => svc.isActive).reduce<number | null>((min, svc) => {
    const price = Number(svc.price);
    return min === null || price < min ? price : min;
  }, null);

  return (
    <div className="pb-24">
      <div className="relative h-36 w-full sm:h-48">
        <SalonCover name={s.name} coverUrl={s.coverUrl} className="h-full w-full" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />
      </div>

      <div className="mx-auto max-w-3xl px-4">
        <div className="-mt-10 relative flex items-start justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-lg">
          <div className="min-w-0">
            <h1 className="text-xl font-bold">{s.name}</h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted">
              <Star className="size-4 fill-warning text-warning" aria-hidden />
              <span className="font-medium text-foreground">{s.rating.toFixed(1)}</span>
              <span>({s.reviewCount} sharh)</span>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => toggleSaved.mutate({ salonId, saved: isSaved })}
              aria-pressed={isSaved}
              aria-label={isSaved ? "Saqlanganlardan olib tashlash" : "Saqlash"}
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border hover:bg-surface-muted"
            >
              <Heart className={isSaved ? "size-5 fill-accent text-accent" : "size-5"} aria-hidden />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex items-start justify-between gap-2 text-muted">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{s.city ? `${s.city}, ${s.address}` : s.address}</span>
            </div>
            <a
              href={yandexDirectionsUrl(s.lat, s.lng, s.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-muted"
            >
              <Navigation className="size-3.5" aria-hidden />
              Yo&apos;nalish
            </a>
          </div>
          {s.phone && (
            <div className="flex items-center gap-2 text-muted">
              <Phone className="size-4 shrink-0" aria-hidden />
              <a href={`tel:${s.phone}`} className="hover:text-foreground">{s.phone}</a>
            </div>
          )}
          {s.workingHours && s.workingHours.length > 0 && (
            <div className="flex items-start gap-2 text-muted">
              <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div className="flex flex-col gap-0.5">
                {s.workingHours.map((wh) => (
                  <span key={wh.id}>
                    {WEEKDAYS[wh.dayOfWeek]}: {wh.startTime}–{wh.endTime}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {s.description && <p className="mt-4 text-sm text-foreground/90">{s.description}</p>}

        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold">Xizmatlar</h2>
          {services.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="flex flex-col gap-2">
              {(services.data ?? [])
                .filter((svc) => svc.isActive)
                .map((svc) => (
                  <div key={svc.id} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm">
                    <div>
                      <p className="font-medium">{svc.name}</p>
                      <p className="text-xs text-muted">{svc.durationMinutes} daqiqa</p>
                    </div>
                    <p className="font-semibold">{formatMoney(svc.price)}</p>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold">Sartaroshlar</h2>
          {barbers.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {(barbers.data ?? []).map((staff) => (
                <Link
                  key={staff.id}
                  href={`/barbers/${staff.barberId}`}
                  className="flex shrink-0 flex-col items-center gap-1 text-center"
                >
                  <Avatar user={staff.barber.user} size={56} />
                  <p className="max-w-16 truncate text-xs">{staff.barber.user.firstName}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold">Sharhlar</h2>
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

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-surface p-3 md:bottom-0">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {typeof startingPrice === "number" && (
            <div className="text-sm">
              <span className="text-muted">Boshlanadi: </span>
              <span className="font-semibold">{formatMoney(startingPrice)}</span>
            </div>
          )}
          <Button size="lg" className="ml-auto" onClick={() => router.push(`/salons/${salonId}/book`)}>
            Bron qilish
          </Button>
        </div>
      </div>
    </div>
  );
}
