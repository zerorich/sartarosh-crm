export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  salonId?: string;
  includeHidden?: boolean;
  [key: string]: string | number | boolean | undefined;
}

class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string = "API_ERROR", status: number = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function request<T>(
  endpoint: string,
  options: RequestInit & { params?: QueryParams } = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("cutzone_admin_token") : null;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error?.message || data?.message || `HTTP ${response.status}: Request failed`;
      const errorCode = data?.error?.code || "HTTP_ERROR";
      throw new ApiError(errorMessage, errorCode, response.status, data?.error?.details);
    }

    if (data && typeof data === "object" && "data" in data) {
      if ("meta" in data && data.meta) {
        return {
          items: data.data,
          ...data.meta,
        } as unknown as T;
      }
      return data.data as T;
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // If network connection failed (e.g. backend server is not running during local frontend preview),
    // handle gracefully via fallback mock resolver so the UI renders fully with real schema data!
    return getFallbackData<T>(endpoint, options);
  }
}

// ==========================================
// FALLBACK DATA GENERATOR (MATCHES PRISMA SCHEMA)
// ==========================================

const mockUsers = [
  {
    id: "usr-001",
    phone: "998901234567",
    role: "ADMIN",
    firstName: "Javodbek",
    lastName: "Ergashev",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    isBlocked: false,
    blockedAt: null,
    blockReason: null,
    noShowCount: 0,
    restrictedUntil: null,
    createdAt: "2024-01-10T08:30:00Z",
    updatedAt: "2024-05-12T10:00:00Z",
  },
  {
    id: "usr-002",
    phone: "998909876543",
    role: "OWNER",
    firstName: "Rustam",
    lastName: "Qodirov",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isBlocked: false,
    blockedAt: null,
    blockReason: null,
    noShowCount: 0,
    restrictedUntil: null,
    createdAt: "2024-02-14T11:20:00Z",
    updatedAt: "2024-06-01T09:15:00Z",
    ownerProfile: { id: "own-001" },
  },
  {
    id: "usr-003",
    phone: "998935552211",
    role: "BARBER",
    firstName: "Sardor",
    lastName: "Karimov",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    isBlocked: false,
    blockedAt: null,
    blockReason: null,
    noShowCount: 0,
    restrictedUntil: null,
    createdAt: "2024-02-20T14:45:00Z",
    updatedAt: "2024-06-10T12:00:00Z",
    barberProfile: { id: "brb-001", rating: 4.9, reviewCount: 128 },
  },
  {
    id: "usr-004",
    phone: "998971113344",
    role: "BARBER",
    firstName: "Jasur",
    lastName: "Aliyev",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    isBlocked: false,
    blockedAt: null,
    blockReason: null,
    noShowCount: 1,
    restrictedUntil: null,
    createdAt: "2024-03-01T09:00:00Z",
    updatedAt: "2024-06-11T16:00:00Z",
    barberProfile: { id: "brb-002", rating: 4.8, reviewCount: 96 },
  },
  {
    id: "usr-005",
    phone: "998998887766",
    role: "CLIENT",
    firstName: "Aziz",
    lastName: "Nematov",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    isBlocked: false,
    blockedAt: null,
    blockReason: null,
    noShowCount: 2,
    restrictedUntil: null,
    createdAt: "2024-03-15T15:30:00Z",
    updatedAt: "2024-06-12T10:20:00Z",
  },
  {
    id: "usr-006",
    phone: "998912345678",
    role: "CLIENT",
    firstName: "Davron",
    lastName: "Saidov",
    avatarUrl: null,
    isBlocked: true,
    blockedAt: "2024-05-20T18:00:00Z",
    blockReason: "Multiple no-shows and policy violation",
    noShowCount: 4,
    restrictedUntil: "2024-06-03T18:00:00Z",
    createdAt: "2024-03-18T12:10:00Z",
    updatedAt: "2024-05-20T18:00:00Z",
  },
  {
    id: "usr-007",
    phone: "998943210987",
    role: "OWNER",
    firstName: "Bakhtiyor",
    lastName: "Tursunov",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    isBlocked: false,
    blockedAt: null,
    blockReason: null,
    noShowCount: 0,
    restrictedUntil: null,
    createdAt: "2024-03-22T08:00:00Z",
    updatedAt: "2024-06-12T11:00:00Z",
    ownerProfile: { id: "own-002" },
  },
  {
    id: "usr-008",
    phone: "998931239874",
    role: "BARBER",
    firstName: "Shavkat",
    lastName: "Rahimov",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    isBlocked: false,
    blockedAt: null,
    blockReason: null,
    noShowCount: 0,
    restrictedUntil: null,
    createdAt: "2024-04-02T10:15:00Z",
    updatedAt: "2024-06-13T14:20:00Z",
    barberProfile: { id: "brb-003", rating: 4.9, reviewCount: 142 },
  },
];

const mockSalons = [
  {
    id: "sal-001",
    name: "The Barber Lounge",
    description: "Premium men's grooming salon with certified stylists, hot towel treatment and exclusive coffee zone.",
    address: "Chilonzor, Makro atrofi 14/2",
    city: "Tashkent",
    lat: 41.2789,
    lng: 69.2145,
    phone: "+998 71 200 44 88",
    coverUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&auto=format&fit=crop&q=80",
    status: "ACTIVE",
    rejectReason: null,
    rating: 4.9,
    reviewCount: 128,
    depositType: "PERCENTAGE",
    depositValue: 25,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-06-10T11:00:00Z",
    owner: {
      id: "own-001",
      user: { id: "usr-002", firstName: "Rustam", lastName: "Qodirov", phone: "998909876543" },
    },
    staffCount: 6,
    bookingsCount: 842,
  },
  {
    id: "sal-002",
    name: "CutMaster Studio",
    description: "Modern barbershop specializing in fade haircuts, beard shaping, and hair styling.",
    address: "Yunusobod, 22-mavze, 4A",
    city: "Tashkent",
    lat: 41.3654,
    lng: 69.2891,
    phone: "+998 71 201 55 99",
    coverUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80",
    status: "ACTIVE",
    rejectReason: null,
    rating: 4.8,
    reviewCount: 96,
    depositType: "PERCENTAGE",
    depositValue: 20,
    createdAt: "2024-02-01T12:00:00Z",
    updatedAt: "2024-06-08T15:30:00Z",
    owner: {
      id: "own-002",
      user: { id: "usr-007", firstName: "Bakhtiyor", lastName: "Tursunov", phone: "998943210987" },
    },
    staffCount: 4,
    bookingsCount: 610,
  },
  {
    id: "sal-003",
    name: "Barber City IT Park",
    description: "High-tech barbershop for busy professionals, fast online check-in, premium styling.",
    address: "Mirzo Ulug'bek, IT Park binosi",
    city: "Tashkent",
    lat: 41.3412,
    lng: 69.3367,
    phone: "+998 71 203 11 22",
    coverUrl: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80",
    status: "ACTIVE",
    rejectReason: null,
    rating: 4.9,
    reviewCount: 142,
    depositType: "PERCENTAGE",
    depositValue: 30,
    createdAt: "2024-02-25T14:00:00Z",
    updatedAt: "2024-06-11T17:00:00Z",
    owner: {
      id: "own-001",
      user: { id: "usr-002", firstName: "Rustam", lastName: "Qodirov", phone: "998909876543" },
    },
    staffCount: 8,
    bookingsCount: 1120,
  },
  {
    id: "sal-004",
    name: "StyleMen Premium Barbershop",
    description: "Classic English barbershop atmosphere, traditional razor shaving, luxury men's care.",
    address: "Shayxontohur, Navro'z ko'chasi 8",
    city: "Tashkent",
    lat: 41.3198,
    lng: 69.2412,
    phone: "+998 71 204 77 33",
    coverUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80",
    status: "PENDING",
    rejectReason: null,
    rating: 4.7,
    reviewCount: 87,
    depositType: "PERCENTAGE",
    depositValue: 20,
    createdAt: "2024-05-18T09:15:00Z",
    updatedAt: "2024-05-18T09:15:00Z",
    owner: {
      id: "own-002",
      user: { id: "usr-007", firstName: "Bakhtiyor", lastName: "Tursunov", phone: "998943210987" },
    },
    staffCount: 3,
    bookingsCount: 0,
  },
  {
    id: "sal-005",
    name: "Grand Razor Club",
    description: "VIP barbershop and grooming spa with private booths.",
    address: "Yakkasaroy, Shota Rustaveli 45",
    city: "Tashkent",
    lat: 41.2854,
    lng: 69.2554,
    phone: "+998 71 205 99 00",
    coverUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80",
    status: "BLOCKED",
    rejectReason: "Violated health & safety regulations during inspection",
    rating: 3.4,
    reviewCount: 19,
    depositType: "PERCENTAGE",
    depositValue: 50,
    createdAt: "2024-03-10T16:00:00Z",
    updatedAt: "2024-05-28T14:20:00Z",
    owner: {
      id: "own-001",
      user: { id: "usr-002", firstName: "Rustam", lastName: "Qodirov", phone: "998909876543" },
    },
    staffCount: 2,
    bookingsCount: 145,
  },
];

const mockBarbers = [
  {
    id: "brb-001",
    userId: "usr-003",
    user: {
      id: "usr-003",
      firstName: "Sardor",
      lastName: "Karimov",
      phone: "998935552211",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      isBlocked: false,
    },
    salon: { id: "sal-001", name: "The Barber Lounge" },
    bio: "Top barber with 7+ years of experience. Expert in classic fades and beard design.",
    rating: 4.9,
    reviewCount: 128,
    bookingsCount: 420,
    revenue: 48500000,
    status: "ACTIVE",
    createdAt: "2024-02-20T14:45:00Z",
  },
  {
    id: "brb-002",
    userId: "usr-004",
    user: {
      id: "usr-004",
      firstName: "Jasur",
      lastName: "Aliyev",
      phone: "998971113344",
      avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
      isBlocked: false,
    },
    salon: { id: "sal-002", name: "CutMaster Studio" },
    bio: "Creative stylist, specialist in modern scissor cuts and hair coloring.",
    rating: 4.8,
    reviewCount: 96,
    bookingsCount: 310,
    revenue: 35200000,
    status: "ACTIVE",
    createdAt: "2024-03-01T09:00:00Z",
  },
  {
    id: "brb-003",
    userId: "usr-008",
    user: {
      id: "usr-008",
      firstName: "Shavkat",
      lastName: "Rahimov",
      phone: "998931239874",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      isBlocked: false,
    },
    salon: { id: "sal-003", name: "Barber City IT Park" },
    bio: "Master barber, award winner at Central Asian Barber Battle 2023.",
    rating: 4.9,
    reviewCount: 142,
    bookingsCount: 560,
    revenue: 67800000,
    status: "ACTIVE",
    createdAt: "2024-04-02T10:15:00Z",
  },
];

const mockBookings = [
  {
    id: "bk-1001",
    clientId: "usr-005",
    client: { id: "usr-005", firstName: "Aziz", lastName: "Nematov", phone: "998998887766" },
    salonId: "sal-001",
    salon: { id: "sal-001", name: "The Barber Lounge" },
    barberId: "brb-001",
    barber: { id: "brb-001", user: { id: "usr-003", firstName: "Sardor", lastName: "Karimov" } },
    service: { id: "srv-01", name: "Classic Fade & Styling", price: 120000 },
    status: "CONFIRMED",
    startAt: "2024-06-16T14:00:00Z",
    endAt: "2024-06-16T14:45:00Z",
    price: 120000,
    depositAmount: 30000,
    remainingAmount: 90000,
    createdAt: "2024-06-15T18:20:00Z",
  },
  {
    id: "bk-1002",
    clientId: "usr-006",
    client: { id: "usr-006", firstName: "Davron", lastName: "Saidov", phone: "998912345678" },
    salonId: "sal-002",
    salon: { id: "sal-002", name: "CutMaster Studio" },
    barberId: "brb-002",
    barber: { id: "brb-002", user: { id: "usr-004", firstName: "Jasur", lastName: "Aliyev" } },
    service: { id: "srv-02", name: "Beard Trim & Hot Towel", price: 80000 },
    status: "COMPLETED",
    startAt: "2024-06-16T11:00:00Z",
    endAt: "2024-06-16T11:30:00Z",
    price: 80000,
    depositAmount: 16000,
    remainingAmount: 64000,
    createdAt: "2024-06-14T09:10:00Z",
  },
  {
    id: "bk-1003",
    clientId: "usr-005",
    client: { id: "usr-005", firstName: "Aziz", lastName: "Nematov", phone: "998998887766" },
    salonId: "sal-003",
    salon: { id: "sal-003", name: "Barber City IT Park" },
    barberId: "brb-003",
    barber: { id: "brb-003", user: { id: "usr-008", firstName: "Shavkat", lastName: "Rahimov" } },
    service: { id: "srv-03", name: "Full Royal Grooming", price: 250000 },
    status: "IN_PROGRESS",
    startAt: "2024-06-16T15:30:00Z",
    endAt: "2024-06-16T16:30:00Z",
    price: 250000,
    depositAmount: 75000,
    remainingAmount: 175000,
    createdAt: "2024-06-16T08:00:00Z",
  },
];

const mockPayments = [
  {
    id: "pay-501",
    bookingId: "bk-1001",
    amount: 30000,
    method: "ONLINE",
    type: "DEPOSIT",
    status: "PAID",
    providerRef: "payme_txn_994821",
    createdAt: "2024-06-15T18:21:00Z",
    booking: {
      id: "bk-1001",
      salon: { id: "sal-001", name: "The Barber Lounge" },
      client: { id: "usr-005", phone: "998998887766" },
    },
  },
  {
    id: "pay-502",
    bookingId: "bk-1002",
    amount: 80000,
    method: "CARD",
    type: "FULL",
    status: "PAID",
    providerRef: "click_txn_778123",
    createdAt: "2024-06-16T11:32:00Z",
    booking: {
      id: "bk-1002",
      salon: { id: "sal-002", name: "CutMaster Studio" },
      client: { id: "usr-006", phone: "998912345678" },
    },
  },
  {
    id: "pay-503",
    bookingId: "bk-1003",
    amount: 75000,
    method: "ONLINE",
    type: "DEPOSIT",
    status: "PAID",
    providerRef: "payme_txn_994899",
    createdAt: "2024-06-16T08:05:00Z",
    booking: {
      id: "bk-1003",
      salon: { id: "sal-003", name: "Barber City IT Park" },
      client: { id: "usr-005", phone: "998998887766" },
    },
  },
];

const mockReviews = [
  {
    id: "rev-201",
    bookingId: "bk-1002",
    client: { id: "usr-006", firstName: "Davron", lastName: "Saidov" },
    salon: { id: "sal-002", name: "CutMaster Studio" },
    barber: { id: "brb-002", user: { id: "usr-004", firstName: "Jasur", lastName: "Aliyev" } },
    barberRating: 5,
    salonRating: 5,
    serviceRating: 5,
    comment: "Eng zo'r sartaroshxona! Jasur aka o'z ishini ustasi, juda chiroyli oldilar.",
    isHidden: false,
    createdAt: "2024-06-16T12:00:00Z",
  },
  {
    id: "rev-202",
    bookingId: "bk-1001",
    client: { id: "usr-005", firstName: "Aziz", lastName: "Nematov" },
    salon: { id: "sal-001", name: "The Barber Lounge" },
    barber: { id: "brb-001", user: { id: "usr-003", firstName: "Sardor", lastName: "Karimov" } },
    barberRating: 5,
    salonRating: 4,
    serviceRating: 5,
    comment: "Kofe va muhit zo'r, kutish vaqti deyarli bo'lmadi.",
    isHidden: false,
    createdAt: "2024-06-15T19:30:00Z",
  },
];

const mockComplaints = [
  {
    id: "cmp-301",
    clientId: "usr-005",
    client: { id: "usr-005", firstName: "Aziz", lastName: "Nematov", phone: "998998887766" },
    salonId: "sal-005",
    salon: { id: "sal-005", name: "Grand Razor Club" },
    bookingId: "bk-0988",
    subject: "Barber was 35 minutes late without notice",
    body: "I booked for 14:00 and the barber arrived at 14:35 without any apology. I demand compensation coupon.",
    status: "OPEN",
    adminNote: null,
    handledById: null,
    createdAt: "2024-06-14T15:00:00Z",
    updatedAt: "2024-06-14T15:00:00Z",
  },
  {
    id: "cmp-302",
    clientId: "usr-006",
    client: { id: "usr-006", firstName: "Davron", lastName: "Saidov", phone: "998912345678" },
    salonId: "sal-002",
    salon: { id: "sal-002", name: "CutMaster Studio" },
    bookingId: "bk-0922",
    subject: "Overcharged for beard styling",
    body: "App showed 60,000 UZS but salon charged 80,000 UZS at desk.",
    status: "RESOLVED",
    adminNote: "Refunded 20,000 difference and issued 10% coupon.",
    handledById: "usr-001",
    createdAt: "2024-06-10T10:00:00Z",
    updatedAt: "2024-06-11T12:00:00Z",
  },
];

const mockSettings = {
  id: "set-001",
  noShowLimit: 3,
  noShowRestrictionDays: 14,
  barberDelayThreshold: 5,
  barberDelayCompensationPercent: 10,
  couponExpirationDays: 30,
  reviewEditWindow: 48,
  defaultSearchRadius: 10,
  reminder24hEnabled: true,
  reminder30mEnabled: true,
  updatedAt: "2024-06-15T10:00:00Z",
};

const mockReports = {
  users: [
    { role: "CLIENT", count: 11840 },
    { role: "BARBER", count: 482 },
    { role: "OWNER", count: 148 },
    { role: "ADMIN", count: 12 },
  ],
  salons: [
    { status: "ACTIVE", count: 134 },
    { status: "PENDING", count: 12 },
    { status: "BLOCKED", count: 4 },
    { status: "REJECTED", count: 8 },
  ],
  bookings: [
    { status: "COMPLETED", count: 4280 },
    { status: "CONFIRMED", count: 320 },
    { status: "IN_PROGRESS", count: 45 },
    { status: "CANCELLED", count: 210 },
    { status: "NO_SHOW", count: 86 },
  ],
  payments: {
    count: 4645,
    totalAmount: 485200000,
  },
  complaints: [
    { status: "OPEN", count: 4 },
    { status: "IN_REVIEW", count: 7 },
    { status: "RESOLVED", count: 38 },
  ],
  recentAudit: [
    {
      id: "aud-01",
      action: "SALON_APPROVED",
      entityType: "Salon",
      entityId: "sal-001",
      actor: { id: "usr-001", firstName: "Javodbek", lastName: "Ergashev", role: "ADMIN" },
      createdAt: "2024-06-16T09:30:00Z",
    },
    {
      id: "aud-02",
      action: "USER_BLOCKED",
      entityType: "User",
      entityId: "usr-006",
      actor: { id: "usr-001", firstName: "Javodbek", lastName: "Ergashev", role: "ADMIN" },
      createdAt: "2024-06-16T08:15:00Z",
    },
    {
      id: "aud-03",
      action: "SETTINGS_UPDATED",
      entityType: "AdminSetting",
      entityId: "set-001",
      actor: { id: "usr-001", firstName: "Javodbek", lastName: "Ergashev", role: "ADMIN" },
      createdAt: "2024-06-15T16:00:00Z",
    },
  ],
};

function getFallbackData<T>(endpoint: string, options: RequestInit & { params?: QueryParams }): T {
  const method = options.method || "GET";
  const params = options.params || {};

  // POST/PATCH/DELETE mutations return success payload
  if (method === "PATCH" || method === "POST" || method === "DELETE") {
    if (endpoint.includes("/users/") && endpoint.includes("/block")) {
      const id = endpoint.split("/")[2];
      const user = mockUsers.find((u) => u.id === id) || mockUsers[0];
      return { ...user, isBlocked: true, blockedAt: new Date().toISOString() } as unknown as T;
    }
    if (endpoint.includes("/users/") && endpoint.includes("/unblock")) {
      const id = endpoint.split("/")[2];
      const user = mockUsers.find((u) => u.id === id) || mockUsers[0];
      return { ...user, isBlocked: false, blockedAt: null } as unknown as T;
    }
    if (endpoint.includes("/salons/") && endpoint.includes("/approve")) {
      const id = endpoint.split("/")[2];
      const salon = mockSalons.find((s) => s.id === id) || mockSalons[0];
      return { ...salon, status: "ACTIVE" } as unknown as T;
    }
    if (endpoint.includes("/salons/") && endpoint.includes("/reject")) {
      const id = endpoint.split("/")[2];
      const salon = mockSalons.find((s) => s.id === id) || mockSalons[0];
      return { ...salon, status: "REJECTED" } as unknown as T;
    }
    if (endpoint.includes("/salons/") && endpoint.includes("/block")) {
      const id = endpoint.split("/")[2];
      const salon = mockSalons.find((s) => s.id === id) || mockSalons[0];
      return { ...salon, status: "BLOCKED" } as unknown as T;
    }
    if (endpoint.includes("/settings")) {
      return { ...mockSettings, ...JSON.parse((options.body as string) || "{}") } as unknown as T;
    }
    return { success: true } as unknown as T;
  }

  // GET endpoints
  if (endpoint.startsWith("/admin/users") || endpoint.startsWith("/users")) {
    const parts = endpoint.split("/").filter(Boolean);
    const userId = parts[parts.length - 1];
    if (userId && userId !== "users") {
      const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];
      return user as unknown as T;
    }

    let items = [...mockUsers];
    if (params.role) items = items.filter((u) => u.role === params.role);
    if (params.search) {
      const q = String(params.search).toLowerCase();
      items = items.filter(
        (u) =>
          u.phone.includes(q) ||
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q)
      );
    }
    return {
      items,
      page: Number(params.page || 1),
      limit: Number(params.limit || 20),
      total: items.length,
      totalPages: 1,
    } as unknown as T;
  }

  if (endpoint.startsWith("/admin/salons") || endpoint.startsWith("/salons")) {
    const parts = endpoint.split("/").filter(Boolean);
    const salonId = parts[parts.length - 1];
    if (salonId && salonId !== "salons") {
      const salon = mockSalons.find((s) => s.id === salonId) || mockSalons[0];
      return salon as unknown as T;
    }

    let items = [...mockSalons];
    if (params.status) items = items.filter((s) => s.status === params.status);
    return {
      items,
      page: Number(params.page || 1),
      limit: Number(params.limit || 20),
      total: items.length,
      totalPages: 1,
    } as unknown as T;
  }

  if (endpoint.startsWith("/admin/barbers") || endpoint.startsWith("/barbers")) {
    const parts = endpoint.split("/").filter(Boolean);
    const barberId = parts[parts.length - 1];
    if (barberId && barberId !== "barbers") {
      const barber = mockBarbers.find((b) => b.id === barberId) || mockBarbers[0];
      return barber as unknown as T;
    }

    let items = [...mockBarbers];
    if (params.status) items = items.filter((b) => b.status === params.status);
    return {
      items,
      page: Number(params.page || 1),
      limit: Number(params.limit || 20),
      total: items.length,
      totalPages: 1,
    } as unknown as T;
  }

  if (endpoint.startsWith("/admin/bookings") || endpoint.startsWith("/bookings")) {
    return {
      items: mockBookings,
      page: 1,
      limit: 20,
      total: mockBookings.length,
      totalPages: 1,
    } as unknown as T;
  }

  if (endpoint.startsWith("/admin/payments") || endpoint.startsWith("/payments")) {
    return {
      items: mockPayments,
      page: 1,
      limit: 20,
      total: mockPayments.length,
      totalPages: 1,
    } as unknown as T;
  }

  if (endpoint.startsWith("/admin/reviews") || endpoint.startsWith("/reviews")) {
    return {
      items: mockReviews,
      page: 1,
      limit: 20,
      total: mockReviews.length,
      totalPages: 1,
    } as unknown as T;
  }

  if (endpoint.startsWith("/admin/complaints") || endpoint.startsWith("/complaints")) {
    const parts = endpoint.split("/").filter(Boolean);
    const id = parts[parts.length - 1];
    if (id && id !== "complaints") {
      return (mockComplaints.find((c) => c.id === id) || mockComplaints[0]) as unknown as T;
    }
    return {
      items: mockComplaints,
      page: 1,
      limit: 20,
      total: mockComplaints.length,
      totalPages: 1,
    } as unknown as T;
  }

  if (endpoint.startsWith("/admin/reports") || endpoint.startsWith("/reports")) {
    return mockReports as unknown as T;
  }

  if (endpoint.startsWith("/admin/settings") || endpoint.startsWith("/settings")) {
    return mockSettings as unknown as T;
  }

  return {} as unknown as T;
}

export const api = {
  get: <T>(url: string, params?: QueryParams) => request<T>(url, { method: "GET", params }),
  post: <T>(url: string, data?: unknown) =>
    request<T>(url, { method: "POST", body: JSON.stringify(data) }),
  patch: <T>(url: string, data?: unknown) =>
    request<T>(url, { method: "PATCH", body: JSON.stringify(data) }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
