import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

interface AccessPayload {
  sub: string;
  role: string;
  typ: "access";
}

export async function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken as string | undefined;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : cookieToken;

    if (!token) {
      return next();
    }

    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "sartarosh",
      audience: "sartarosh",
    }) as AccessPayload;

    if (payload.typ !== "access") {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { barberProfile: true, ownerProfile: true },
    });

    if (!user || user.isBlocked) {
      return next();
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
  } catch {
    next();
  }
}

export function requireUser(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(AppError.unauthorized());
  }
  next();
}
