"use client";

import { useCallback, useState } from "react";
import { useLocationStore } from "@/store/location-store";

export type LocationPermission = "idle" | "prompt" | "granted" | "denied" | "unsupported";

interface UseUserLocationResult {
  loading: boolean;
  permission: LocationPermission;
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  requestLocation: () => void;
}

/** Brauzer Geolocation API ustidan yupqa hook — location joriy holatga store orqali saqlanadi. */
export function useUserLocation(): UseUserLocationResult {
  const setLocation = useLocationStore((s) => s.setLocation);
  const stored = useLocationStore((s) => s.location);

  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<LocationPermission>("idle");
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setPermission("unsupported");
      setError("Bu qurilmada joylashuvni aniqlab bo'lmaydi.");
      return;
    }

    setLoading(true);
    setError(null);
    setPermission("prompt");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermission("granted");
        setLoading(false);
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          source: "current",
        });
      },
      (err) => {
        setLoading(false);
        setPermission(err.code === err.PERMISSION_DENIED ? "denied" : "prompt");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Joylashuvingizni aniqlay olmadik."
            : "Joylashuvni olishda xatolik yuz berdi.",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [setLocation]);

  return {
    loading,
    permission: stored?.source === "current" ? "granted" : permission,
    latitude: stored?.source === "current" ? stored.lat : null,
    longitude: stored?.source === "current" ? stored.lng : null,
    error,
    requestLocation,
  };
}
