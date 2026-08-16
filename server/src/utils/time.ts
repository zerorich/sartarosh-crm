// Salon working hours are defined in local Uzbekistan time (Asia/Tashkent, UTC+5, no DST),
// independent of the server process's own system timezone.
const SALON_UTC_OFFSET_MINUTES = 5 * 60;

function toSalonLocal(date: Date): Date {
  return new Date(date.getTime() + SALON_UTC_OFFSET_MINUTES * 60_000);
}

export function getDayOfWeek(date: Date): number {
  return toSalonLocal(date).getUTCDay();
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function dateAtMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setMinutes(minutes);
  return result;
}

export function isIntervalWithinHours(
  startAt: Date,
  endAt: Date,
  openTime: string,
  closeTime: string,
): boolean {
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);
  const startLocal = toSalonLocal(startAt);
  const endLocal = toSalonLocal(endAt);
  const startMinutes = startLocal.getUTCHours() * 60 + startLocal.getUTCMinutes();
  const endMinutes = endLocal.getUTCHours() * 60 + endLocal.getUTCMinutes();
  return startMinutes >= openMinutes && endMinutes <= closeMinutes;
}

export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function minutesBetween(later: Date, earlier: Date): number {
  return Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / 60_000));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Inclusive start / exclusive end of the previous UTC calendar day. */
export function previousUtcDayRange(now = new Date()): { from: Date; to: Date; dateKey: string } {
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const from = new Date(to.getTime() - 86_400_000);
  return { from, to, dateKey: from.toISOString().slice(0, 10) };
}
