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

export interface ChartDataPoint {
  date: string;
  revenue: number;
  bookings: number;
  newUsers: number;
  newSalons: number;
  noShowRate: number;
}

export interface AdminReports {
  overview?: {
    revenue: number;
    bookings: number;
    users: number;
    salons: number;
    barbers: number;
    noShows: number;
    cancellations: number;
    averageRating: number;
    revenueGrowth: number;
    bookingsGrowth: number;
  };
  users: Array<{ role: string; count: number }>;
  salons: Array<{ status: string; count: number }>;
  bookings: Array<{ status: string; count: number }>;
  payments: {
    count: number;
    totalAmount: number;
  };
  complaints: Array<{ status: string; count: number }>;
  timeSeries?: ChartDataPoint[];
  recentAudit: AuditLogItem[];
}
