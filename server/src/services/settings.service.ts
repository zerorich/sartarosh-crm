import { prisma } from "../config/prisma";
import { toNumber } from "../utils/money";
import { cacheDel, cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "../utils/cache";

const DEFAULTS = {
  noShowLimit: 3,
  noShowRestrictionDays: 14,
  barberDelayThreshold: 5,
  barberDelayCompensationPercent: 10,
  couponExpirationDays: 30,
  reviewEditWindow: 48,
  defaultSearchRadius: 10,
  reminder24hEnabled: true,
  reminder30mEnabled: true,
};

type SettingsRow = {
  id: string;
  noShowLimit: number;
  noShowRestrictionDays: number;
  barberDelayThreshold: number;
  barberDelayCompensationPercent: unknown;
  couponExpirationDays: number;
  reviewEditWindow: number;
  defaultSearchRadius: number;
  reminder24hEnabled: boolean;
  reminder30mEnabled: boolean;
  updatedAt: Date | string;
};

function toPlainSettings(row: SettingsRow) {
  return {
    ...row,
    barberDelayCompensationPercent: toNumber(row.barberDelayCompensationPercent as never),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt),
  };
}

export async function getSettings() {
  const cached = await cacheGet<SettingsRow>(CACHE_KEYS.settings);
  if (cached) return toPlainSettings(cached);

  const existing = await prisma.adminSetting.findFirst();
  const row = existing ?? (await prisma.adminSetting.create({ data: DEFAULTS }));
  const plain = toPlainSettings(row);
  await cacheSet(CACHE_KEYS.settings, plain, CACHE_TTL.settings);
  return plain;
}

export async function updateSettings(data: Partial<typeof DEFAULTS>) {
  const current = await getSettings();
  const updated = await prisma.adminSetting.update({
    where: { id: current.id },
    data,
  });
  const plain = toPlainSettings(updated);
  await cacheDel(CACHE_KEYS.settings);
  await cacheSet(CACHE_KEYS.settings, plain, CACHE_TTL.settings);
  return plain;
}
