import Image from "next/image";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";
import { avatarColorFor } from "@/lib/palette";

interface AvatarProps {
  user: { firstName?: string | null; lastName?: string | null; avatarUrl?: string | null } | null | undefined;
  size?: number;
  className?: string;
}

export function Avatar({ user, size = 40, className }: AvatarProps) {
  if (user?.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={initials(user)}
        width={size}
        height={size}
        className={cn("rounded-full object-cover ring-1 ring-black/5", className)}
      />
    );
  }

  const seed = `${user?.firstName ?? ""}${user?.lastName ?? "?"}`;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-1 ring-black/5",
        avatarColorFor(seed || "?"),
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials(user)}
    </div>
  );
}
