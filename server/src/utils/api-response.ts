import type { Response } from "express";
import type { PaginatedResult } from "../types";

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function created<T>(res: Response, data: T) {
  return ok(res, data, 201);
}

export function paginated<T>(res: Response, result: PaginatedResult<T>) {
  return ok(res, result);
}

export function fail(res: Response, message: string, code: string, status = 400) {
  return res.status(status).json({ success: false, message, code });
}
