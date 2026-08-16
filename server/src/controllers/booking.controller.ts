import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import {
  arriveBooking,
  cancelBooking,
  completeBooking,
  createBooking,
  getBookingById,
  listBookings,
  markNoShow,
  quoteBookingPrice,
  startBooking,
} from "../services/booking.service";
import { AppError } from "../utils/app-error";
import { created, ok, paginated } from "../utils/api-response";
import { routeParam, routeQuery } from "../utils/route-params";

function requireUser(req: Request) {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}

function canManageBookingLifecycle(role: Role) {
  return role === "BARBER" || role === "OWNER" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function postBooking(req: Request, res: Response) {
  const user = requireUser(req);
  const body = req.body as {
    salonId: string;
    barberId: string;
    serviceId: string;
    startAt: Date;
    couponId?: string;
  };

  const booking = await createBooking({
    clientId: user.id,
    salonId: body.salonId,
    barberId: body.barberId,
    serviceId: body.serviceId,
    startAt: body.startAt,
    couponId: body.couponId,
  });

  return created(res, booking);
}

export async function getQuote(req: Request, res: Response) {
  const user = requireUser(req);
  const { salonId, serviceId, couponId } = routeQuery<{
    salonId: string;
    serviceId: string;
    couponId?: string;
  }>(req);

  const quote = await quoteBookingPrice({ clientId: user.id, salonId, serviceId, couponId });
  return ok(res, quote);
}

export async function getBookings(req: Request, res: Response) {
  const user = requireUser(req);
  const query = routeQuery<{
    page: number;
    limit: number;
    status?: import("@prisma/client").BookingStatus;
    salonId?: string;
    from?: Date;
    to?: Date;
  }>(req);

  const result = await listBookings({
    userId: user.id,
    role: user.role,
    barberProfileId: user.barberProfileId,
    ownerProfileId: user.ownerProfileId,
    status: query.status,
    salonId: query.salonId,
    from: query.from,
    to: query.to,
    page: query.page,
    limit: query.limit,
  });

  return paginated(res, result);
}

export async function getBooking(req: Request, res: Response) {
  const booking = await getBookingById(routeParam(req));
  return ok(res, booking);
}

export async function postCancel(req: Request, res: Response) {
  const user = requireUser(req);
  const body = req.body as { reason?: string };
  const booking = await cancelBooking(routeParam(req), user.id, body.reason);
  return ok(res, booking);
}

export async function postArrive(req: Request, res: Response) {
  const user = requireUser(req);
  if (!canManageBookingLifecycle(user.role)) {
    throw AppError.forbidden("Only staff can mark arrival");
  }
  const booking = await arriveBooking(routeParam(req));
  return ok(res, booking);
}

export async function postStart(req: Request, res: Response) {
  const user = requireUser(req);
  if (!canManageBookingLifecycle(user.role)) {
    throw AppError.forbidden("Only staff can start a booking");
  }
  const booking = await startBooking(routeParam(req));
  return ok(res, booking);
}

export async function postComplete(req: Request, res: Response) {
  const user = requireUser(req);
  if (!canManageBookingLifecycle(user.role)) {
    throw AppError.forbidden("Only staff can complete a booking");
  }
  const booking = await completeBooking(routeParam(req));
  return ok(res, booking);
}

export async function postNoShow(req: Request, res: Response) {
  const user = requireUser(req);
  if (!canManageBookingLifecycle(user.role)) {
    throw AppError.forbidden("Only staff can mark no-show");
  }
  const booking = await markNoShow(routeParam(req));
  return ok(res, booking);
}
