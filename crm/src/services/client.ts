import { API_URL } from "@/lib/env";
import { ApiError, ERROR_CODES, type ApiResponse } from "@/types/api";

/** Query obyektlari turli, o'ziga xos interfeyslardan keladi — index signature talab qilinmasin. */
type QueryParams = object;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  /** 401 bo'lganda /auth/refresh orqali qayta urinishni o'chirish (masalan refresh so'rovining o'zida). */
  skipAuthRetry?: boolean;
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    credentials: "include",
    headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let json: ApiResponse<T> | undefined;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    // no body (e.g. 204) — fine below if res.ok
  }

  if (!res.ok || !json || json.success === false) {
    const code = json && json.success === false ? json.code : ERROR_CODES.INTERNAL_ERROR;
    const message = json && json.success === false ? json.message : `Server xatosi (${res.status})`;

    if (res.status === 401 && !options.skipAuthRetry && !isRetry) {
      const refreshed = await tryRefreshSession();
      if (refreshed) {
        return request<T>(path, options, true);
      }
    }

    throw new ApiError(message, code, res.status);
  }

  return (json as { success: true; data: T }).data;
}

export const apiClient = {
  get: <T>(path: string, query?: RequestOptions["query"]) => request<T>(path, { method: "GET", query }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body: body ?? {} }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: body ?? {} }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body: body ?? {} }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
