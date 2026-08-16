import { ERROR_CODES, type ErrorCode } from "../types";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode | string;
  public readonly isOperational = true;

  constructor(message: string, statusCode: number, code: ErrorCode | string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, code: ErrorCode | string = ERROR_CODES.VALIDATION_ERROR) {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = "Authentication required", code: ErrorCode | string = ERROR_CODES.UNAUTHORIZED) {
    return new AppError(message, 401, code);
  }

  static forbidden(message = "Access denied", code: ErrorCode | string = ERROR_CODES.FORBIDDEN) {
    return new AppError(message, 403, code);
  }

  static notFound(message = "Resource not found", code: ErrorCode | string = ERROR_CODES.NOT_FOUND) {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code: ErrorCode | string = ERROR_CODES.CONFLICT) {
    return new AppError(message, 409, code);
  }
}
