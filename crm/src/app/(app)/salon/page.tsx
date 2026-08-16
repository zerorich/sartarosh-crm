"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useMySalons, useSalon, useUpdateSalon } from "@/hooks/queries";
import { getErrorMessage } from "@/lib/error-messages";
import { cn } from "@/lib/utils";
import { Store } from "lucide-react";
import type { WorkingHour } from "@/types/salon";

const WEEKDAYS = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

type Hours = { dayOfWeek: number; startTime: string; endTime: string };

function hoursFromSalon(workingHours: WorkingHour[] | undefined): Hours[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const existing = workingHours?.find((h) => h.dayOfWeek === dayOfWeek);
    return { dayOfWeek, startTime: existing?.startTime ?? "", endTime: existing?.endTime ?? "" };
  });
}

export default function SalonPage() {
  const salons = useMySalons();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = salons.data?.items ?? [];
  const salonId = selectedId ?? items[0]?.id;
  // The list endpoint's publicSelect omits workingHours — fetch the single
  // salon's full detail (which includes them) for the edit form.
  const salon = useSalon(salonId);

  if (salons.isLoading) return <div className="mx-auto max-w-lg px-4 py-6"><Skeleton className="h-64 w-full" /></div>;
  if (salons.error) return <ErrorState error={salons.error} onRetry={() => salons.refetch()} />;
  if (!salonId) return <EmptyState icon={Store} title="Sizga tegishli salon topilmadi" />;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Salon</h1>

      {items.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {items.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium",
                salonId === s.id ? "border-primary bg-primary text-primary-foreground" : "border-border",
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {salon.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : salon.error || !salon.data ? (
        <ErrorState error={salon.error} onRetry={() => salon.refetch()} />
      ) : (
        <SalonForm key={salon.data.id} salon={salon.data} />
      )}
    </div>
  );
}

function SalonForm({ salon }: { salon: NonNullable<ReturnType<typeof useSalon>["data"]> }) {
  const updateSalon = useUpdateSalon();
  const [name, setName] = useState(salon.name);
  const [description, setDescription] = useState(salon.description ?? "");
  const [address, setAddress] = useState(salon.address);
  const [city, setCity] = useState(salon.city ?? "");
  const [phone, setPhone] = useState(salon.phone ?? "");
  const [hours, setHours] = useState<Hours[]>(() => hoursFromSalon(salon.workingHours));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateHour(dayOfWeek: number, patch: Partial<Hours>) {
    setHours((prev) => prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, ...patch } : h)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await updateSalon.mutateAsync({
        id: salon.id,
        input: {
          name,
          description: description.trim() || null,
          address,
          city: city.trim() || null,
          phone: phone.trim() || null,
          workingHours: hours
            .filter((h) => TIME_PATTERN.test(h.startTime) && TIME_PATTERN.test(h.endTime))
            .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime })),
        },
      });
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
      <Field label="Nomi" value={name} onChange={setName} />
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="description">
          Tavsif
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:border-primary"
        />
      </div>
      <Field label="Manzil" value={address} onChange={setAddress} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Shahar" value={city} onChange={setCity} />
        <Field label="Telefon" value={phone} onChange={setPhone} />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold">Ish vaqti</p>
        <div className="flex flex-col gap-2">
          {hours.map((h) => (
            <div key={h.dayOfWeek} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 text-muted">{WEEKDAYS[h.dayOfWeek]}</span>
              <TimeInput value={h.startTime} onChange={(v) => updateHour(h.dayOfWeek, { startTime: v })} />
              <span className="text-muted">—</span>
              <TimeInput value={h.endTime} onChange={(v) => updateHour(h.dayOfWeek, { endTime: v })} />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Saqlandi.</p>}

      <Button type="submit" loading={updateSalon.isPending} fullWidth>
        Saqlash
      </Button>
    </form>
  );
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Native <input type="time"> wasn't reliably reflecting its value in the
 * DOM in this app. Plain text input with the same "HH:mm" shape works fine
 * (all the other controlled inputs on this page use this pattern).
 */
function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const invalid = value.length > 0 && !TIME_PATTERN.test(value);
  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="09:00"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-24 flex-1 rounded-lg border bg-transparent px-2 text-sm outline-none focus:border-primary",
        invalid ? "border-danger" : "border-border",
      )}
    />
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
