"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck2, Scissors, Store, User, Users, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isOwner } = useAuth();

  const items = [
    { href: "/", label: "Bronlar", icon: CalendarCheck2 },
    ...(isOwner
      ? [
          { href: "/services", label: "Xizmatlar", icon: Scissors },
          { href: "/staff", label: "Xodimlar", icon: Users },
          { href: "/finance", label: "Moliya", icon: Wallet },
          { href: "/salon", label: "Salon", icon: Store },
        ]
      : []),
    { href: "/profile", label: "Profil", icon: User },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Asosiy navigatsiya"
    >
      <div className="flex h-16 items-stretch justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium",
                active ? "text-accent" : "text-muted",
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
