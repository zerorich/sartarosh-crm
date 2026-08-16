import type { Role, SalonStatus } from "@prisma/client";
import type { Request, Response } from "express";
import {
  approveSalon,
  blockSalon,
  blockUser,
  deleteReview,
  getAdminSettings,
  getBarberById,
  getBookingById,
  getPaymentById,
  getReports,
  getSalonById,
  getUserById,
  hideReview,
  listBarbers,
  listBookings,
  listPayments,
  listReviews,
  listSalons,
  listUsers,
  patchAdminSettings,
  rejectSalon,
  restoreReview,
} from "../services/admin.service";
import { refundPayment } from "../services/payment.service";
import { ok, paginated } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { routeParam, routeQuery } from "../utils/route-params";

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{ page: number; limit: number; role?: string; search?: string }>(req);
  const result = await listUsers({
    page: query.page,
    limit: query.limit,
    role: query.role as Role | undefined,
    search: query.search,
  });
  return paginated(res, result);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await getUserById(routeParam(req));
  return ok(res, user);
});

export const patchBlockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await blockUser({
    userId: routeParam(req),
    actorId: req.user!.id,
    block: req.body.block,
    reason: req.body.reason,
  });
  return ok(res, user);
});

export const patchUnblockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await blockUser({
    userId: routeParam(req),
    actorId: req.user!.id,
    block: false,
  });
  return ok(res, user);
});

export const getSalons = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{ page: number; limit: number; status?: string }>(req);
  const result = await listSalons({
    page: query.page,
    limit: query.limit,
    status: query.status as SalonStatus | undefined,
  });
  return paginated(res, result);
});

export const getSalon = asyncHandler(async (req: Request, res: Response) => {
  const salon = await getSalonById(routeParam(req));
  return ok(res, salon);
});

export const patchApproveSalon = asyncHandler(async (req: Request, res: Response) => {
  const salon = await approveSalon(routeParam(req), req.user!.id);
  return ok(res, salon);
});

export const patchRejectSalon = asyncHandler(async (req: Request, res: Response) => {
  const salon = await rejectSalon(routeParam(req), req.user!.id, req.body.reason);
  return ok(res, salon);
});

export const patchBlockSalon = asyncHandler(async (req: Request, res: Response) => {
  const salon = await blockSalon(routeParam(req), req.user!.id, req.body.reason);
  return ok(res, salon);
});

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{ page: number; limit: number; status?: string; salonId?: string }>(req);
  const result = await listBookings({
    page: query.page,
    limit: query.limit,
    status: query.status,
    salonId: query.salonId,
  });
  return paginated(res, result);
});

export const getBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await getBookingById(routeParam(req));
  return ok(res, booking);
});

export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{ page: number; limit: number; status?: string }>(req);
  const result = await listPayments({
    page: query.page,
    limit: query.limit,
    status: query.status,
  });
  return paginated(res, result);
});

export const getPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await getPaymentById(routeParam(req));
  return ok(res, payment);
});

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{ page: number; limit: number; includeHidden?: boolean }>(req);
  const result = await listReviews({
    page: query.page,
    limit: query.limit,
    includeHidden: query.includeHidden,
  });
  return paginated(res, result);
});

export const patchHideReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await hideReview(routeParam(req), req.user!.id);
  return ok(res, review);
});

export const patchRestoreReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await restoreReview(routeParam(req), req.user!.id);
  return ok(res, review);
});

export const removeReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await deleteReview(routeParam(req), req.user!.id);
  return ok(res, review);
});

export const getBarbers = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{ page: number; limit: number; search?: string; salonId?: string }>(req);
  const result = await listBarbers({
    page: query.page,
    limit: query.limit,
    search: query.search,
    salonId: query.salonId,
  });
  return paginated(res, result);
});

export const getBarber = asyncHandler(async (req: Request, res: Response) => {
  const barber = await getBarberById(routeParam(req));
  return ok(res, barber);
});

export const refundPaymentAdmin = asyncHandler(async (req: Request, res: Response) => {
  const payment = await refundPayment(
    routeParam(req),
    { id: req.user!.id, role: req.user!.role, ownerProfileId: req.user!.ownerProfileId },
    req.body.reason,
  );
  return ok(res, payment);
});

export const getAdminReports = asyncHandler(async (_req: Request, res: Response) => {
  const reports = await getReports();
  return ok(res, reports);
});

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getAdminSettings();
  return ok(res, settings);
});

export const patchSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await patchAdminSettings(req.user!.id, req.body);
  return ok(res, settings);
});
