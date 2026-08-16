export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "purple";

export const USER_ROLE_CONFIG = {
  CLIENT: { label: "Client", variant: "info" as BadgeVariant },
  BARBER: { label: "Barber", variant: "purple" as BadgeVariant },
  OWNER: { label: "Salon Owner", variant: "warning" as BadgeVariant },
  ADMIN: { label: "Admin", variant: "danger" as BadgeVariant },
  SUPER_ADMIN: { label: "Super Admin", variant: "danger" as BadgeVariant },
};

export const SALON_STATUS_CONFIG = {
  PENDING: { label: "Pending Review", variant: "warning" as BadgeVariant },
  ACTIVE: { label: "Active", variant: "success" as BadgeVariant },
  REJECTED: { label: "Rejected", variant: "danger" as BadgeVariant },
  BLOCKED: { label: "Blocked", variant: "danger" as BadgeVariant },
  SUSPENDED: { label: "Suspended", variant: "warning" as BadgeVariant },
};

export const BOOKING_STATUS_CONFIG = {
  PENDING: { label: "Pending", variant: "warning" as BadgeVariant },
  CONFIRMED: { label: "Confirmed", variant: "info" as BadgeVariant },
  ARRIVED: { label: "Arrived", variant: "purple" as BadgeVariant },
  IN_PROGRESS: { label: "In Progress", variant: "purple" as BadgeVariant },
  COMPLETED: { label: "Completed", variant: "success" as BadgeVariant },
  CANCELLED: { label: "Cancelled", variant: "danger" as BadgeVariant },
  NO_SHOW: { label: "No Show", variant: "danger" as BadgeVariant },
};

export const PAYMENT_STATUS_CONFIG = {
  PENDING: { label: "Pending", variant: "warning" as BadgeVariant },
  PAID: { label: "Paid", variant: "success" as BadgeVariant },
  FAILED: { label: "Failed", variant: "danger" as BadgeVariant },
  REFUNDED: { label: "Refunded", variant: "neutral" as BadgeVariant },
};

export const COMPLAINT_STATUS_CONFIG = {
  OPEN: { label: "Open", variant: "danger" as BadgeVariant },
  IN_REVIEW: { label: "In Review", variant: "warning" as BadgeVariant },
  RESOLVED: { label: "Resolved", variant: "success" as BadgeVariant },
  REJECTED: { label: "Rejected", variant: "neutral" as BadgeVariant },
};
