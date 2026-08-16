import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Backend ba'zi joyda Prisma Decimal'ni raw qaytaradi (JSON'da string bo'lib
 * ketadi: "75000"), ba'zida esa Number()'ga o'girib yuboradi. UI hech qachon
 * ishonmasin — doim shu orqali o'qisin.
 */
export function toMoney(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? n : 0;
}

/**
 * Chrome (va boshqa brauzerlar)ning "uz-UZ" uchun ICU/CLDR ma'lumotlari
 * to'liq emas — Intl.DateTimeFormat oy/hafta kunini "M08", "Sun" kabi
 * inglizcha/kod ko'rinishida qaytarishi mumkin. Shu sababli sana/vaqt/pul
 * formatlash Intl'ga bog'liq bo'lmasdan qo'lda amalga oshiriladi.
 */
function groupThousands(value: number): string {
  const sign = value < 0 ? "-" : "";
  const digits = Math.round(Math.abs(value)).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return sign + grouped;
}

export function formatMoney(value: number | string | null | undefined): string {
  return `${groupThousands(toMoney(value))} so'm`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];
const WEEKDAYS_SHORT = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateWithWeekday(iso: string): string {
  const d = new Date(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fullName(user: { firstName?: string | null; lastName?: string | null } | null | undefined): string {
  if (!user) return "";
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
}

export function initials(user: { firstName?: string | null; lastName?: string | null } | null | undefined): string {
  if (!user) return "?";
  const a = user.firstName?.[0] ?? "";
  const b = user.lastName?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}
