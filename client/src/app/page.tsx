"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarCheck2, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SalonList } from "@/components/salon/SalonList";
import { LocationPickerSheet } from "@/components/location/LocationPickerSheet";
import { useNearbySalons } from "@/hooks/queries";
import { useLocationStore } from "@/store/location-store";

const SalonsMap = dynamic(() => import("@/components/map/SalonsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-surface-muted text-sm text-muted">
      Xarita yuklanmoqda...
    </div>
  ),
});

export default function HomePage() {
  const location = useLocationStore((s) => s.location);
  const [pickerOpen, setPickerOpen] = useState(false);
  const router = useRouter();

  const nearby = useNearbySalons(location?.lat ?? null, location?.lng ?? null, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {!location ? (
        <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-14 text-center">
          <h1 className="max-w-md text-3xl font-bold leading-tight sm:text-4xl">
            Eng yaqin <span className="text-accent">sartaroshxonani</span> toping
          </h1>
          <p className="max-w-sm text-sm text-muted">
            CutZone — siz uchun eng yaxshi barber va sartaroshxonalar bir joyda.
          </p>
          <Button size="lg" onClick={() => setPickerOpen(true)}>
            <MapPin className="size-5" aria-hidden />
            Yaqin sartaroshxonalarni ko&apos;rish
          </Button>
          <button onClick={() => router.push("/search")} className="cursor-pointer text-sm text-muted underline underline-offset-4">
            yoki nomi bo&apos;yicha qidiring
          </button>
        </section>
      ) : (
        <>
          <section className="mb-6 overflow-hidden rounded-2xl border border-border">
            <div className="h-56 w-full sm:h-72">
              <SalonsMap
                userLocation={location}
                salons={nearby.data ?? []}
                onViewSalon={(id) => router.push(`/salons/${id}`)}
                className="h-full w-full"
              />
            </div>
          </section>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Yaqin sartaroshxonalar</h2>
            <Link href="/salons" className="text-sm font-medium text-accent">
              Barchasini ko&apos;rish →
            </Link>
          </div>

          <SalonList
            salons={nearby.data?.slice(0, 6)}
            isLoading={nearby.isLoading}
            error={nearby.error}
            onRetry={() => nearby.refetch()}
            emptyDescription="Qidiruv radiusini kengaytiring yoki joylashuvni o'zgartiring."
            emptyAction={
              <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                Joylashuvni o&apos;zgartirish
              </Button>
            }
          />
        </>
      )}

      <section className="mt-10 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-3">
        <InfoItem icon={MapPin} title="Eng yaqin sartaroshxonalar" desc="Manzilingiz yaqinidagi eng yaxshi salonlar" />
        <InfoItem icon={CalendarCheck2} title="Onlayn bron qilish" desc="Vaqtingiz tejaladi, oldindan band qiling" />
        <InfoItem icon={ShieldCheck} title="Xavfsiz to'lov" desc="Depozitni oldindan xavfsiz to'lang" />
      </section>

      <section className="mt-8 flex items-center gap-4 rounded-2xl bg-primary p-6 text-primary-foreground">
        <Sparkles className="size-8 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">CutZone — sizning uslubingiz, bizning zonamiz!</p>
          <p className="text-sm opacity-80">Professional ustalar, sifat kafolati.</p>
        </div>
      </section>

      <LocationPickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}

function InfoItem({ icon: Icon, title, desc }: { icon: typeof MapPin; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-accent">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
    </div>
  );
}
