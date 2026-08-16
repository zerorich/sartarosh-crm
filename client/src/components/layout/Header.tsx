"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, ChevronDown, Heart, MapPin, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocationStore } from "@/store/location-store";
import { Avatar } from "@/components/ui/Avatar";
import { LocationPickerSheet } from "@/components/location/LocationPickerSheet";

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocationStore((s) => s.location);
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="CutZone bosh sahifa">
          <Image src="/logo-header.png" alt="CutZone" width={139} height={60} className="h-10 w-auto sm:h-11" priority />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface-muted">
            Bosh sahifa
          </Link>
          <Link href="/salons" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface-muted">
            Sartaroshxonalar
          </Link>
          <Link href="/bookings" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface-muted">
            Mening bronlarim
          </Link>
        </nav>

        <button
          onClick={() => router.push("/search")}
          aria-label="Qidirish"
          className="ml-auto flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground hover:bg-surface-muted md:hidden"
        >
          <Search className="size-5" aria-hidden />
        </button>

        <button
          onClick={() => setPickerOpen(true)}
          className="hidden shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-surface-muted md:flex"
        >
          <MapPin className="size-4 text-accent" aria-hidden />
          <span className="max-w-32 truncate">{location?.label ?? "Joylashuv"}</span>
          <ChevronDown className="size-4 text-muted" aria-hidden />
        </button>

        {isAuthenticated && (
          <>
            <Link
              href="/profile/saved"
              aria-label="Saqlanganlar"
              className="hidden size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-muted sm:flex"
            >
              <Heart className="size-5" aria-hidden />
            </Link>
            <Link
              href="/bookings"
              aria-label="Bildirishnomalar"
              className="hidden size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-muted sm:flex"
            >
              <Bell className="size-5" aria-hidden />
            </Link>
          </>
        )}

        <Link
          href={isAuthenticated ? "/profile" : "/login"}
          className="flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-surface-muted"
        >
          <Avatar user={user} size={32} />
          <span className="hidden max-w-24 truncate text-sm font-medium sm:inline">
            {isAuthenticated ? user?.firstName || "Profil" : "Kirish"}
          </span>
        </Link>
      </div>

      <LocationPickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </header>
  );
}
