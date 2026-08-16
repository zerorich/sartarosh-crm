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
  message?: string;
  code?: string;
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

export class ApiError extends Error {
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

function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cutzone_admin_token");
  localStorage.removeItem("cutzone_admin_refresh_token");
  localStorage.removeItem("cutzone_admin_user");
}

function isPaginatedPayload(
  value: unknown
): value is { items: unknown[]; page: number; limit: number; total: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "items" in value &&
    Array.isArray((value as { items: unknown }).items) &&
    "page" in value &&
    "limit" in value &&
    "total" in value
  );
}

/** Backend list endpoints return pagination fields inside `data`, without totalPages. */
function unwrapSuccessPayload<T>(payload: unknown): T {
  if (isPaginatedPayload(payload)) {
    const { items, page, limit, total } = payload;
    return {
      items,
      page,
      limit,
      total,
      totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
    } as T;
  }

  return payload as T;
}

function extractErrorFields(data: unknown): {
  message: string;
  code: string;
  details?: unknown;
} {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const nestedError =
    record?.error && typeof record.error === "object"
      ? (record.error as Record<string, unknown>)
      : undefined;

  const message =
    (typeof record?.message === "string" ? record.message : undefined) ||
    (typeof nestedError?.message === "string" ? nestedError.message : undefined) ||
    "Request failed";

  const code =
    (typeof record?.code === "string" ? record.code : undefined) ||
    (typeof nestedError?.code === "string" ? nestedError.code : undefined) ||
    "HTTP_ERROR";

  const details = nestedError?.details ?? record?.details;

  return { message, code, details };
}

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
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: Request failed`,
          "HTTP_ERROR",
          response.status
        );
      }
      throw new ApiError("Invalid JSON response from server", "PARSE_ERROR", response.status);
    }

    if (!response.ok) {
      const { message, code, details } = extractErrorFields(data);

      if (response.status === 401) {
        clearAuthTokens();
      }

      throw new ApiError(message, code, response.status, details);
    }

    if (data && typeof data === "object" && "data" in data) {
      const envelope = data as {
        data: unknown;
        meta?: { page: number; limit: number; total: number; totalPages: number };
      };
      if (envelope.meta) {
        return {
          items: envelope.data,
          ...envelope.meta,
        } as T;
      }
      return unwrapSuccessPayload<T>(envelope.data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      "Network error — check that the backend is reachable",
      "NETWORK_ERROR",
      0
    );
  }
}

export const api = {
  get: <T>(url: string, params?: QueryParams) => request<T>(url, { method: "GET", params }),
  post: <T>(url: string, data?: unknown) =>
    request<T>(url, {
      method: "POST",
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    }),
  patch: <T>(url: string, data?: unknown) =>
    request<T>(url, {
      method: "PATCH",
      ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
    }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
