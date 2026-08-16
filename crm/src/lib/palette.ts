/** Ism/ID asosida barqaror (deterministik) rang tanlaydi — tashqi rasm kerak emas. */
const GRADIENTS = [
  "from-neutral-800 to-neutral-950",
  "from-red-800 to-neutral-950",
  "from-stone-700 to-neutral-950",
  "from-zinc-800 to-black",
  "from-red-900 to-stone-950",
  "from-neutral-700 to-red-950",
];

const AVATAR_COLORS = [
  "bg-red-600",
  "bg-neutral-700",
  "bg-stone-600",
  "bg-zinc-700",
  "bg-orange-700",
  "bg-rose-700",
];

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function gradientFor(seed: string): string {
  return GRADIENTS[hash(seed) % GRADIENTS.length];
}

export function avatarColorFor(seed: string): string {
  return AVATAR_COLORS[hash(seed) % AVATAR_COLORS.length];
}
