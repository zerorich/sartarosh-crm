"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LocateFixed, Map as MapIcon } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useLocationStore } from "@/store/location-store";

const MapLocationPicker = dynamic(() => import("@/components/map/MapLocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center bg-surface-muted text-sm text-muted">
      Xarita yuklanmoqda...
    </div>
  ),
});

interface LocationPickerSheetProps {
  open: boolean;
  onClose: () => void;
  onPicked?: () => void;
}

export function LocationPickerSheet({ open, onClose, onPicked }: LocationPickerSheetProps) {
  const { loading, error, permission, requestLocation } = useUserLocation();
  const setLocation = useLocationStore((s) => s.setLocation);
  const [showMap, setShowMap] = useState(false);
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);

  function handleCurrentLocation() {
    requestLocation();
    onPicked?.();
    onClose();
  }

  function handleConfirmMapPick() {
    if (!pending) return;
    setLocation({ ...pending, source: "map", label: "Xaritadan tanlangan" });
    onPicked?.();
    setShowMap(false);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title="Joylashuvni tanlang">
      {!showMap ? (
        <div className="flex flex-col gap-2 p-4">
          <button
            onClick={handleCurrentLocation}
            disabled={loading}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 text-left hover:bg-surface-muted disabled:opacity-60"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <LocateFixed className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium">Joylashuvimni aniqlash</span>
              <span className="block text-xs text-muted">GPS orqali avtomatik topish</span>
            </span>
          </button>

          <button
            onClick={() => setShowMap(true)}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 text-left hover:bg-surface-muted"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-foreground">
              <MapIcon className="size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-medium">Xaritadan tanlash</span>
              <span className="block text-xs text-muted">Xaritada nuqtani belgilang</span>
            </span>
          </button>

          <Button variant="ghost" onClick={onClose} className="mt-1">
            Keyinroq
          </Button>

          {permission === "denied" && error && (
            <p className="rounded-lg bg-danger/10 p-3 text-xs text-danger">{error}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4">
          <p className="text-sm text-muted">Xaritada kerakli joyni bosing.</p>
          <div className="overflow-hidden rounded-xl">
            <MapLocationPicker onPick={setPending} />
          </div>
          <Button onClick={handleConfirmMapPick} disabled={!pending} fullWidth>
            Shu joyni tanlash
          </Button>
        </div>
      )}
    </Sheet>
  );
}
