import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

type Resource = "salon" | "booking" | "staff" | "service" | "expense" | "review";

export function requireOwnership(resource: Resource, param = "id") {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw AppError.unauthorized();
      if (req.user.role === "ADMIN" || req.user.role === "SUPER_ADMIN") {
        return next();
      }

      const id = String(req.params[param] ?? "");
      if (!id) throw AppError.badRequest("Missing resource id");

      const allowed = await checkOwnership(resource, id, req);
      if (!allowed) throw AppError.forbidden("You do not own this resource");
      next();
    } catch (error) {
      next(error);
    }
  };
}

async function checkOwnership(resource: Resource, id: string, req: Request): Promise<boolean> {
  const user = req.user!;

  switch (resource) {
    case "salon": {
      const salon = await prisma.salon.findUnique({ where: { id }, select: { ownerId: true } });
      return Boolean(salon && user.ownerProfileId === salon.ownerId);
    }
    case "booking": {
      const booking = await prisma.booking.findUnique({
        where: { id },
        select: { clientId: true, barberId: true, salon: { select: { ownerId: true } } },
      });
      if (!booking) return false;
      if (user.role === "CLIENT") return booking.clientId === user.id;
      if (user.role === "BARBER") return booking.barberId === user.barberProfileId;
      if (user.role === "OWNER") return booking.salon.ownerId === user.ownerProfileId;
      return false;
    }
    case "staff": {
      const staff = await prisma.salonStaff.findUnique({
        where: { id },
        select: { barberId: true, salon: { select: { ownerId: true } } },
      });
      if (!staff) return false;
      if (user.role === "BARBER") return staff.barberId === user.barberProfileId;
      if (user.role === "OWNER") return staff.salon.ownerId === user.ownerProfileId;
      return false;
    }
    case "service": {
      const service = await prisma.service.findUnique({
        where: { id },
        select: { salon: { select: { ownerId: true } } },
      });
      return Boolean(service && user.ownerProfileId === service.salon.ownerId);
    }
    case "expense": {
      const expense = await prisma.expense.findUnique({
        where: { id },
        select: { salon: { select: { ownerId: true } } },
      });
      return Boolean(expense && user.ownerProfileId === expense.salon.ownerId);
    }
    case "review": {
      const review = await prisma.review.findUnique({ where: { id }, select: { clientId: true } });
      return Boolean(review && review.clientId === user.id);
    }
    default:
      return false;
  }
}
