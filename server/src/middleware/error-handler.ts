import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { ERROR_CODES } from "../types";
import { AppError } from "../utils/app-error";
import { fail } from "../utils/api-response";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return fail(res, err.message, err.code, err.statusCode);
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    return fail(res, message || "Validation failed", ERROR_CODES.VALIDATION_ERROR, 400);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return fail(res, "Resource already exists", ERROR_CODES.CONFLICT, 409);
    }
    if (err.code === "P2025") {
      return fail(res, "Resource not found", ERROR_CODES.NOT_FOUND, 404);
    }
  }

  console.error("[unhandled]", err);
  const message = env.NODE_ENV === "production" ? "Internal server error" : err instanceof Error ? err.message : "Unknown error";
  return fail(res, message, ERROR_CODES.INTERNAL_ERROR, 500);
}

export function notFoundHandler(_req: Request, res: Response) {
  return fail(res, "Route not found", ERROR_CODES.NOT_FOUND, 404);
}
