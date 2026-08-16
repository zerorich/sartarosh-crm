import type { Request } from "express";

export function routeParam(req: Request, key = "id"): string {
  const value = req.params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return String(value ?? "");
}

export function routeQuery<T>(req: Request): T {
  return req.query as unknown as T;
}

export function routeBody<T>(req: Request): T {
  return req.body as unknown as T;
}
