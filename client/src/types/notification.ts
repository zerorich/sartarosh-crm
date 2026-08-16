export type NotificationType =
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "PAYMENT_SUCCESS"
  | "BOOKING_REMINDER"
  | "BOOKING_CANCELLED"
  | "BARBER_STARTED"
  | "BARBER_DELAYED"
  | "COUPON_RECEIVED"
  | "REVIEW_AVAILABLE"
  | "NO_SHOW_WARNING"
  | "BOOKING_RESTRICTION";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}
