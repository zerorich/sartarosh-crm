export interface AdminSettings {
  id: string;
  noShowLimit: number;
  noShowRestrictionDays: number;
  barberDelayThreshold: number;
  barberDelayCompensationPercent: number;
  couponExpirationDays: number;
  reviewEditWindow: number;
  defaultSearchRadius: number;
  cancellationWindowHours?: number;
  defaultDepositPercent?: number;
  allowInstantBooking?: boolean;
  reminder24hEnabled: boolean;
  reminder30mEnabled: boolean;
  updatedAt: string;
}

export type AdminSettingsUpdatePayload = Partial<Omit<AdminSettings, "id" | "updatedAt">>;
