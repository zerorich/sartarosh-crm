import Image from "next/image";
import Link from "next/link";
import { AtSign, Phone, Send } from "lucide-react";

const LINKS = [
  { href: "/salons", label: "Sartaroshxonalar" },
  { href: "/search", label: "Qidiruv" },
  { href: "/bookings", label: "Mening bronlarim" },
  { href: "/profile", label: "Profil" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:justify-between">
        <div>
          <Image src="/logo-header.png" alt="CutZone" width={139} height={60} className="h-9 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Eng yaqin sartaroshxonani toping va bir necha bosishda bron qiling.
          </p>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Havolalar</p>
          <ul className="flex flex-col gap-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-muted hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold">Bog&apos;lanish</p>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden />
              <a href="tel:+998901111111" className="hover:text-foreground">
                +998 90 111 11 11
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Send className="size-4 shrink-0" aria-hidden />
              <a
                href="https://t.me/cutzone"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Telegram
              </a>
            </li>
            <li className="flex items-center gap-2">
              <AtSign className="size-4 shrink-0" aria-hidden />
              <a
                href="https://instagram.com/cutzone"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} CutZone. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  );
}
