import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import {
  createPayment,
  getPaymentById,
  refundPayment,
  verifyPayment,
} from "../services/payment.service";
import { AppError } from "../utils/app-error";
import { created, ok } from "../utils/api-response";
import { routeParam } from "../utils/route-params";

function requireUser(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

function canRefund(role: Role) {
  return role === "OWNER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function postCreatePayment(req: Request, res: Response) {
  const user = requireUser(req);
  const body = req.body as {
    bookingId: string;
    method: import("@prisma/client").PaymentMethod;
    type: import("@prisma/client").PaymentType;
  };

  const result = await createPayment(
    {
      bookingId: body.bookingId,
      method: body.method,
      type: body.type,
      userId: user.id,
      role: user.role,
    },
    user.barberProfileId,
    user.ownerProfileId,
  );

  return created(res, result);
}

export async function getPayment(req: Request, res: Response) {
  const user = requireUser(req);
  const payment = await getPaymentById(
    routeParam(req),
    user.id,
    user.role,
    user.barberProfileId,
    user.ownerProfileId,
  );
  return ok(res, payment);
}

export async function postVerifyPayment(req: Request, res: Response) {
  const user = requireUser(req);
  const body = req.body as { signature?: string };

  const payment = await verifyPayment(
    {
      paymentId: routeParam(req),
      signature: body.signature,
      actorId: user.id,
      role: user.role,
    },
    user.barberProfileId,
    user.ownerProfileId,
  );

  return ok(res, payment);
}

export async function postRefundPayment(req: Request, res: Response) {
  const user = requireUser(req);
  if (!canRefund(user.role)) {
    throw AppError.forbidden("Only owners or admins can refund payments");
  }

  const body = req.body as { reason?: string };
  const payment = await refundPayment(
    routeParam(req),
    { id: user.id, role: user.role, ownerProfileId: user.ownerProfileId },
    body.reason,
  );
  return ok(res, payment);
}
