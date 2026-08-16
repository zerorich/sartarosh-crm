"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarberCard } from "@/components/barber/BarberCard";
import { ServiceCard } from "@/components/service/ServiceCard";
import { DatePicker } from "@/components/booking/DatePicker";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { CouponBanner } from "@/components/booking/CouponBanner";
import {
  useAvailability,
  useBarber,
  useBookingQuote,
  useCreateBooking,
  useMyCoupons,
  useSalon,
  useSalonBarbers,
} from "@/hooks/queries";
import { useAuth } from "@/hooks/useAuth";
import { fullName, toDateKey } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-messages";
import { UserRound } from "lucide-react";

type Step = "barber" | "service" | "time" | "summary" | "done";
const STEP_ORDER: Step[] = ["barber", "service", "time", "summary", "done"];
const STEP_LABELS: Record<Step, string> = {
  barber: "Sartarosh",
  service: "Xizmat",
  time: "Vaqt",
  summary: "Xulosa",
  done: "Tayyor",
};

export function BookingFlow({ salonId }: { salonId: string }) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const salon = useSalon(salonId);
  const barbers = useSalonBarbers(salonId);

  const [step, setStep] = useState<Step>("barber");
  const [barberId, setBarberId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()));
  const [startAt, setStartAt] = useState<string | null>(null);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const barberDetail = useBarber(barberId ?? undefined);
  const availability = useAvailability({ salonId, barberId: barberId ?? undefined, serviceId: serviceId ?? undefined, date: dateKey });
  const coupons = useMyCoupons();
  const quote = useBookingQuote({ salonId, serviceId: serviceId ?? undefined, couponId });

  const createBooking = useCreateBooking();

  const [bookingResult, setBookingResult] = useState<Awaited<ReturnType<typeof createBooking.mutateAsync>> | null>(null);

  const selectedBarber = barberDetail.data;
  const selectedService = useMemo(
    () => selectedBarber?.services.find((s) => s.id === serviceId) ?? null,
    [selectedBarber, serviceId],
  );

  function goTo(next: Step) {
    setFormError(null);
    setStep(next);
  }

  function back() {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) goTo(STEP_ORDER[idx - 1]!);
    else router.back();
  }

  async function handleConfirmBooking() {
    if (!barberId || !serviceId || !startAt) return;
    setFormError(null);
    try {
      const booking = await createBooking.mutateAsync({
        salonId,
        barberId,
        serviceId,
        startAt,
        couponId: couponId ?? undefined,
      });
      setBookingResult(booking);
      goTo("done");
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  if (authLoading || salon.isLoading || barbers.isLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-4 h-40 w-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center">
        <EmptyState
          icon={UserRound}
          title="Bron qilish uchun tizimga kiring"
          description="Davom etish uchun avval hisobingizga kiring."
          action={
            <Button onClick={() => router.push(`/login?redirect=/salons/${salonId}/book`)}>Kirish</Button>
          }
        />
      </div>
    );
  }

  if (salon.error || !salon.data) {
    return <ErrorState error={salon.error} onRetry={() => salon.refetch()} title="Salon topilmadi" />;
  }

  const activeStaff = (barbers.data ?? []).filter((s) => s.status === "ACTIVE");

  return (
    <div className="mx-auto max-w-xl px-4 pb-28 pt-4">
      <div className="mb-4 flex items-center gap-3">
        <button onClick={back} aria-label="Orqaga" className="flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-surface-muted">
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <div>
          <p className="text-xs text-muted">{salon.data.name}</p>
          <h1 className="text-base font-bold">{STEP_LABELS[step]}</h1>
        </div>
      </div>

      <StepProgress step={step} />

      {step === "barber" && (
        <div className="mt-4 flex flex-col gap-2">
          {activeStaff.length === 0 ? (
            <EmptyState title="Bu salonda hozircha sartarosh yo'q" />
          ) : (
            activeStaff.map((staff) => (
              <BarberCard
                key={staff.id}
                barber={staff.barber}
                selected={barberId === staff.barberId}
                onSelect={() => {
                  setBarberId(staff.barberId);
                  setServiceId(null);
                  goTo("service");
                }}
              />
            ))
          )}
        </div>
      )}

      {step === "service" && (
        <div className="mt-4 flex flex-col gap-2">
          {barberDetail.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (selectedBarber?.services.length ?? 0) === 0 ? (
            <EmptyState title="Bu sartarosh uchun xizmat topilmadi" />
          ) : (
            selectedBarber!.services.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                selected={serviceId === svc.id}
                onSelect={() => {
                  setServiceId(svc.id);
                  goTo("time");
                }}
              />
            ))
          )}
        </div>
      )}

      {step === "time" && (
        <div className="mt-4 flex flex-col gap-4">
          <DatePicker value={dateKey} onChange={(key) => { setDateKey(key); setStartAt(null); }} />
          {availability.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : availability.error ? (
            <ErrorState error={availability.error} onRetry={() => availability.refetch()} />
          ) : (
            <TimeSlotPicker slots={availability.data?.slots ?? []} value={startAt} onChange={setStartAt} />
          )}
          <Button disabled={!startAt} onClick={() => goTo("summary")} fullWidth>
            Davom etish
          </Button>
        </div>
      )}

      {step === "summary" && selectedBarber && selectedService && startAt && (
        <div className="mt-4 flex flex-col gap-4">
          {coupons.data && coupons.data.length > 0 && (
            <CouponBanner coupons={coupons.data} selectedId={couponId} onSelect={setCouponId} />
          )}
          {quote.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : quote.error || !quote.data ? (
            <ErrorState error={quote.error} onRetry={() => quote.refetch()} title="Narxni hisoblab bo'lmadi" />
          ) : (
            <BookingSummary
              salonName={salon.data.name}
              barberName={fullName(selectedBarber.user) || "Sartarosh"}
              serviceName={selectedService.name}
              startAt={startAt}
              price={quote.data.price}
              couponLabel={quote.data.couponApplied ? "Qo'llanildi" : undefined}
            />
          )}
          {formError && <p className="text-sm text-danger">{formError}</p>}
          <Button loading={createBooking.isPending} disabled={!quote.data} onClick={handleConfirmBooking} fullWidth size="lg">
            Bronni tasdiqlash
          </Button>
        </div>
      )}

      {step === "done" && bookingResult && (
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="size-16 text-success" aria-hidden />
          <h2 className="text-xl font-bold">Bron tasdiqlandi</h2>
          <BookingSummary
            salonName={salon.data.name}
            barberName={fullName(selectedBarber?.user) || "Sartarosh"}
            serviceName={selectedService?.name ?? ""}
            startAt={bookingResult.startAt}
            price={bookingResult.price}
          />
          <Button onClick={() => router.push(`/bookings/${bookingResult.id}`)} fullWidth size="lg">
            Bronni ko&apos;rish
          </Button>
        </div>
      )}
    </div>
  );
}

function StepProgress({ step }: { step: Step }) {
  const visible = STEP_ORDER.filter((s): s is Exclude<Step, "done"> => s !== "done");
  const idx = step === "done" ? visible.length - 1 : visible.indexOf(step);
  return (
    <div className="flex gap-1.5">
      {visible.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-surface-muted"}`}
          aria-hidden
        />
      ))}
    </div>
  );
}
