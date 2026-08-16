import {
  LayoutDashboard,
  Users,
  Building2,
  Scissors,
  CalendarCheck,
  CreditCard,
  Star,
  AlertTriangle,
  BarChart3,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  exact?: boolean;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Salons", href: "/admin/salons", icon: Building2 },
  { name: "Barbers", href: "/admin/barbers", icon: Scissors },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Complaints", href: "/admin/complaints", icon: AlertTriangle },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];
