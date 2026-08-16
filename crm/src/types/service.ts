export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  /** Backend Prisma Decimal sometimes serializes as a string — parse with toMoney(). */
  price: number | string;
  isActive: boolean;
}
