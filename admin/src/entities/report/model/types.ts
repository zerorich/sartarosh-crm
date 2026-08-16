export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  } | null;
}

export interface AdminReports {
  users: Array<{ role: string; count: number }>;
  salons: Array<{ status: string; count: number }>;
  bookings: Array<{ status: string; count: number }>;
  payments: {
    count: number;
    totalAmount: number;
  };
  complaints: Array<{ status: string; count: number }>;
  recentAudit: AuditLogItem[];
}
