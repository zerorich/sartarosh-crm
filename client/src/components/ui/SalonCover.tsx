import Image from "next/image";
import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { gradientFor } from "@/lib/palette";

interface SalonCoverProps {
  name: string;
  coverUrl?: string | null;
  className?: string;
}

/**
 * Real coverUrl bo'lsa shuni ko'rsatadi; bo'lmasa (demo ma'lumotlarda odatda
 * bo'lmaydi) nomga qarab barqaror gradient + ikonka chizadi — tashqi rasm
 * xizmatiga bog'liq bo'lmagani uchun offline'da ham to'liq ishlaydi.
 */
export function SalonCover({ name, coverUrl, className }: SalonCoverProps) {
  if (coverUrl) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={coverUrl} alt={name} fill sizes="400px" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br text-white/90",
        gradientFor(name),
        className,
      )}
      role="img"
      aria-label={name}
    >
      <Scissors className="size-8 opacity-70" aria-hidden />
    </div>
  );
}
