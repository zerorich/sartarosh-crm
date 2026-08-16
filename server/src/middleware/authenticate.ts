import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { ERROR_CODES } from "../types";
import { AppError } from "../utils/app-error";

interface AccessPayload {
  sub: string;
  role: string;
  typ: "access";
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken as string | undefined;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : cookieToken;

    if (!token) {
      throw AppError.unauthorized();
    }

    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "sartarosh",
      audience: "sartarosh",
    }) as AccessPayload;

    if (payload.typ !== "access") {
      throw AppError.unauthorized("Invalid token type");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { barberProfile: true, ownerProfile: true },
    });

    if (!user) {
      throw AppError.unauthorized("User not found");
    }

    if (user.isBlocked) {
      throw AppError.forbidden("User is blocked", ERROR_CODES.USER_BLOCKED);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      barberProfileId: user.barberProfile?.id,
      ownerProfileId: user.ownerProfile?.id,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(AppError.unauthorized("Invalid or expired token"));
  }
}
