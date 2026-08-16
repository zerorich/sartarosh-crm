"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2, ChevronRight, Heart, LogOut, MessageSquareText, Pencil, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { EditProfileSheet } from "@/components/profile/EditProfileSheet";
import { useAuth, useLogout } from "@/hooks/useAuth";

const LINKS = [
  { href: "/bookings", label: "Mening bronlarim", icon: CalendarCheck2 },
  { href: "/reviews", label: "Sharhlarim", icon: MessageSquareText },
  { href: "/profile/saved", label: "Saqlangan salonlar", icon: Heart },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return null;

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <EmptyState
          icon={UserRound}
          title="Profilni ko'rish uchun kiring"
          action={<Button onClick={() => router.push("/login?redirect=/profile")}>Kirish</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center gap-4">
        <Avatar user={user} size={64} />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold">{[user.firstName, user.lastName].filter(Boolean).join(" ") || "Mijoz"}</p>
          <p className="text-sm text-muted">{user.phone}</p>
        </div>
        <button
          onClick={() => setEditOpen(true)}
          aria-label="Profilni tahrirlash"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border hover:bg-surface-muted"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
      </div>

      {user.restrictedUntil && new Date(user.restrictedUntil) > new Date() && (
        <div className="mt-4 rounded-xl bg-danger/10 p-3 text-sm text-danger">
          Booking qilish imkoniyatingiz {new Date(user.restrictedUntil).toLocaleDateString("uz-UZ")} sanasigacha
          vaqtincha cheklangan.
        </div>
      )}

      <div className="mt-6 flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-muted">
            <Icon className="size-5 text-muted" aria-hidden />
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight className="size-4 text-muted" aria-hidden />
          </Link>
        ))}
        <button
          onClick={() => logout.mutate()}
          className="flex cursor-pointer items-center gap-3 px-4 py-3.5 text-left text-danger hover:bg-danger/5"
        >
          <LogOut className="size-5" aria-hidden />
          <span className="flex-1 text-sm font-medium">Chiqish</span>
        </button>
      </div>

      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} user={user} />
    </div>
  );
}
