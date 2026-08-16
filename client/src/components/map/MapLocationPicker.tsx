"use client";

import { useState } from "react";
import { BaseMap, Marker, TASHKENT_CENTER, pickerIcon, useMapEvents } from "./LeafletMap";

interface MapLocationPickerProps {
  initial?: { lat: number; lng: number } | null;
  onPick: (point: { lat: number; lng: number }) => void;
}

function ClickCapture({ onPick }: { onPick: (point: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function MapLocationPicker({ initial, onPick }: MapLocationPickerProps) {
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(initial ?? null);

  function handlePick(next: { lat: number; lng: number }) {
    setPoint(next);
    onPick(next);
  }

  const center = point ? ([point.lat, point.lng] as [number, number]) : TASHKENT_CENTER;

  return (
    <BaseMap center={center} zoom={13} className="h-72 w-full">
      <ClickCapture onPick={handlePick} />
      {point && <Marker position={[point.lat, point.lng]} icon={pickerIcon()} />}
    </BaseMap>
  );
}
