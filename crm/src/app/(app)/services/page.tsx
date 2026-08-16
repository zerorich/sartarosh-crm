"use client";

import { useState } from "react";
import { Plus, Scissors } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { useChangeServicePrice, useCreateService, useMySalons, useSalonServices, useUpdateService } from "@/hooks/queries";
import { getErrorMessage } from "@/lib/error-messages";
import { cn, formatMoney } from "@/lib/utils";
import type { Service } from "@/types/service";

export default function ServicesPage() {
  const salons = useMySalons();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const items = salons.data?.items ?? [];
  const salonId = selectedId ?? items[0]?.id;

  const services = useSalonServices(salonId);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  if (salons.isLoading) return <div className="mx-auto max-w-2xl px-4 py-6"><Skeleton className="h-48 w-full" /></div>;
  if (salons.error) return <ErrorState error={salons.error} onRetry={() => salons.refetch()} />;
  if (!salonId) return <EmptyState icon={Scissors} title="Sizga tegishli salon topilmadi" />;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Xizmatlar</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden /> Yangi xizmat
        </Button>
      </div>

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

      {services.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : services.error ? (
        <ErrorState error={services.error} onRetry={() => services.refetch()} />
      ) : (services.data ?? []).length === 0 ? (
        <EmptyState icon={Scissors} title="Xizmatlar hali qo'shilmagan" />
      ) : (
        <div className="flex flex-col gap-2">
          {(services.data ?? []).map((svc) => (
            <button
              key={svc.id}
              onClick={() => setEditing(svc)}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-surface p-3 text-left hover:bg-surface-muted"
            >
              <div>
                <p className={cn("text-sm font-semibold", !svc.isActive && "text-muted line-through")}>{svc.name}</p>
                <p className="text-xs text-muted">{svc.durationMinutes} daqiqa{!svc.isActive && " · faol emas"}</p>
              </div>
              <p className="text-sm font-semibold">{formatMoney(svc.price)}</p>
            </button>
          ))}
        </div>
      )}

      <CreateServiceSheet open={createOpen} onClose={() => setCreateOpen(false)} salonId={salonId} />
      {editing && (
        <EditServiceSheet service={editing} salonId={salonId} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function CreateServiceSheet({ open, onClose, salonId }: { open: boolean; onClose: () => void; salonId: string }) {
  const createService = useCreateService(salonId);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("30");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createService.mutateAsync({ name, durationMinutes: Number(duration), price: Number(price) });
      setName("");
      setDuration("30");
      setPrice("");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Yangi xizmat">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        <TextField label="Nomi" value={name} onChange={setName} required />
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Davomiyligi (daqiqa)" value={duration} onChange={setDuration} type="number" required />
          <TextField label="Narxi (so'm)" value={price} onChange={setPrice} type="number" required />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={createService.isPending} fullWidth>
          Qo&apos;shish
        </Button>
      </form>
    </Sheet>
  );
}

function EditServiceSheet({ service, salonId, onClose }: { service: Service; salonId: string; onClose: () => void }) {
  const updateService = useUpdateService(salonId);
  const changePrice = useChangeServicePrice(salonId);
  const [name, setName] = useState(service.name);
  const [duration, setDuration] = useState(String(service.durationMinutes));
  const [price, setPrice] = useState(String(Number(service.price)));
  const [isActive, setIsActive] = useState(service.isActive);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await updateService.mutateAsync({
        id: service.id,
        input: { name, durationMinutes: Number(duration), isActive },
      });
      const newPrice = Number(price);
      if (newPrice !== Number(service.price)) {
        await changePrice.mutateAsync({ id: service.id, price: newPrice });
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  const pending = updateService.isPending || changePrice.isPending;

  return (
    <Sheet open onClose={onClose} title="Xizmatni tahrirlash">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        <TextField label="Nomi" value={name} onChange={setName} required />
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Davomiyligi (daqiqa)" value={duration} onChange={setDuration} type="number" required />
          <TextField label="Narxi (so'm)" value={price} onChange={setPrice} type="number" required />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4" />
          Faol (mijozlarga ko&apos;rinadi)
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" loading={pending} fullWidth>
          Saqlash
        </Button>
      </form>
    </Sheet>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-xl border border-border bg-transparent px-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
