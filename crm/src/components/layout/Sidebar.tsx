"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, LogOut, Scissors, Store, Users, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const BASE_LINKS = [{ href: "/", label: "Bronlar", icon: CalendarCheck2 }];
const OWNER_LINKS = [
  { href: "/services", label: "Xizmatlar", icon: Scissors },
  { href: "/staff", label: "Xodimlar", icon: Users },
  { href: "/finance", label: "Moliya", icon: Wallet },
  { href: "/salon", label: "Salon", icon: Store },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isOwner } = useAuth();
  const logout = useLogout();

  const links = isOwner ? [...BASE_LINKS, ...OWNER_LINKS] : BASE_LINKS;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Image src="/logo-header.png" alt="CutZone" width={139} height={60} className="h-8 w-auto" priority />
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface-muted",
              )}
            >
              <Icon className="size-4.5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium hover:bg-surface-muted",
            pathname === "/profile" && "bg-surface-muted",
          )}
        >
          <Avatar user={user} size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate">{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Profil"}</p>
            <p className="truncate text-xs text-muted">{isOwner ? "Salon egasi" : "Sartarosh"}</p>
          </div>
        </Link>
        <button
          onClick={() => logout.mutate()}
          className="mt-1 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/5"
        >
          <LogOut className="size-4.5" aria-hidden />
          Chiqish
        </button>
      </div>
    </aside>
  );
}

export function MobileTopBar() {
  const { user, isOwner } = useAuth();
  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
      <Image src="/logo-header.png" alt="CutZone" width={139} height={60} className="h-7 w-auto" priority />
      <Link href="/profile" className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted">{isOwner ? "Salon egasi" : "Sartarosh"}</span>
        <Avatar user={user} size={28} />
      </Link>
    </div>
  );
}
