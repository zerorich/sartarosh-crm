"use client";

import { useEffect } from "react";
import { BaseMap, Marker, Popup, salonIcon, useMap, userIcon } from "./LeafletMap";
import { formatDistance } from "@/lib/utils";
import type { NearbySalon } from "@/types/salon";

interface SalonsMapProps {
  userLocation: { lat: number; lng: number } | null;
  salons: NearbySalon[];
  selectedSalonId?: string | null;
  onSelectSalon?: (salonId: string) => void;
  onViewSalon?: (salonId: string) => void;
  className?: string;
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);
  return null;
}

export default function SalonsMap({
  userLocation,
  salons,
  selectedSalonId,
  onSelectSalon,
  onViewSalon,
  className,
}: SalonsMapProps) {
  const center = userLocation ? ([userLocation.lat, userLocation.lng] as [number, number]) : undefined;

  return (
    <BaseMap center={center} zoom={13} className={className}>
      {userLocation && (
        <>
          <Recenter lat={userLocation.lat} lng={userLocation.lng} />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} zIndexOffset={1000} />
        </>
      )}
      {salons.map((salon) => (
        <Marker
          key={salon.id}
          position={[salon.lat, salon.lng]}
          icon={salonIcon(salon.id === selectedSalonId)}
          eventHandlers={{ click: () => onSelectSalon?.(salon.id) }}
        >
          <Popup minWidth={200}>
            <div className="p-3">
              <p className="font-semibold text-sm">{salon.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                ⭐ {salon.rating.toFixed(1)} · {formatDistance(salon.distanceKm)}
              </p>
              <p className="text-xs text-gray-500">{salon.address}</p>
              <button
                onClick={() => onViewSalon?.(salon.id)}
                className="mt-2 w-full rounded-lg bg-black py-1.5 text-xs font-medium text-white cursor-pointer"
              >
                Ko&apos;rish
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </BaseMap>
  );
}
