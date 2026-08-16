const MULTIPLIERS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2]!;
  const multiplier = MULTIPLIERS[unit];

  if (!multiplier) {
    throw new Error(`Invalid duration unit: ${unit}`);
  }

  return value * multiplier;
}

export function addDuration(date: Date, duration: string): Date {
  return new Date(date.getTime() + parseDurationToMs(duration));
}
