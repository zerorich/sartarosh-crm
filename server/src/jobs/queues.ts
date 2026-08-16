import { Queue } from "bullmq";
import { env } from "../config/env";

export const jobConnection = { url: env.REDIS_URL };

export const QUEUE_NAMES = {
  notifications: "notifications",
  reminders: "booking-reminders",
  reports: "daily-reports",
  coupons: "coupon-expiration",
  finance: "finance-aggregation",
} as const;

export const notificationQueue = new Queue(QUEUE_NAMES.notifications, { connection: jobConnection });
export const reminderQueue = new Queue(QUEUE_NAMES.reminders, { connection: jobConnection });
export const reportQueue = new Queue(QUEUE_NAMES.reports, { connection: jobConnection });
export const couponQueue = new Queue(QUEUE_NAMES.coupons, { connection: jobConnection });
export const financeQueue = new Queue(QUEUE_NAMES.finance, { connection: jobConnection });
