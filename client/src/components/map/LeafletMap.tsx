"use client";

import "leaflet/dist/leaflet.css";
import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { cn } from "@/lib/utils";

const TASHKENT_CENTER: [number, number] = [41.2995, 69.2401];

function divIcon(html: string, size: number) {
  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function centeredIcon(html: string, size: number) {
  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export const userIcon = centeredIcon(
  `<div style="position:relative;width:16px;height:16px">
     <div class="user-location-pulse" style="position:absolute;inset:0;border-radius:9999px;background:#d8232a"></div>
     <div style="position:absolute;inset:3px;border-radius:9999px;background:#d8232a;border:2px solid white"></div>
   </div>`,
  16,
);

export function salonIcon(selected = false) {
  const size = selected ? 26 : 22;
  return centeredIcon(
    `<div style="width:${size}px;height:${size}px;border-radius:9999px;
       background:${selected ? "#d8232a" : "#17181a"};box-shadow:0 1px 4px rgba(0,0,0,.35);
       display:flex;align-items:center;justify-content:center;border:2px solid white">
       <div style="color:white;font-size:${size === 26 ? 12 : 10}px;line-height:1">✂</div>
     </div>`,
    size,
  );
}

export function pickerIcon() {
  return divIcon(
    `<div style="width:26px;height:26px;border-radius:9999px 9999px 9999px 0;transform:rotate(-45deg);
       background:#d8232a;box-shadow:0 2px 6px rgba(0,0,0,.4);border:2px solid white"></div>`,
    26,
  );
}

interface BaseMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  children?: React.ReactNode;
  scrollWheelZoom?: boolean;
}

export function BaseMap({ center, zoom = 13, className, children, scrollWheelZoom = true }: BaseMapProps) {
  const initialCenter = useMemo(() => center ?? TASHKENT_CENTER, [center]);

  return (
    <MapContainer
      center={initialCenter}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      className={cn("z-0", className)}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {children}
    </MapContainer>
  );
}

export { Marker, Popup, useMap, useMapEvents, TASHKENT_CENTER };
