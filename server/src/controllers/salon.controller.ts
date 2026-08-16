import type { Request, Response } from "express";
import * as salonService from "../services/salon.service";
import { AppError } from "../utils/app-error";
import { ok, created, paginated } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { routeParam, routeQuery } from "../utils/route-params";

export const createSalon = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.ownerProfileId) {
    throw AppError.forbidden("Owner profile required");
  }
  const salon = await salonService.createSalon(req.user.ownerProfileId, req.body);
  return created(res, salon);
});

export const listSalons = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search } = routeQuery<{ page: number; limit: number; search?: string }>(req);
  const result = await salonService.listSalons(page, limit, req.user, search);
  return paginated(res, result);
});

export const nearbySalons = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, radius, search } = routeQuery<{
    lat: number;
    lng: number;
    radius?: number;
    search?: string;
  }>(req);
  const salons = await salonService.findNearbySalons(lat, lng, radius, search);
  return ok(res, salons);
});

export const getSalon = asyncHandler(async (req: Request, res: Response) => {
  const salon = await salonService.getSalonById(routeParam(req), req.user);
  return ok(res, salon);
});

export const updateSalon = asyncHandler(async (req: Request, res: Response) => {
  const salon = await salonService.updateSalon(routeParam(req), req.body);
  return ok(res, salon);
});

export const deleteSalon = asyncHandler(async (req: Request, res: Response) => {
  const result = await salonService.deleteSalon(routeParam(req));
  return ok(res, result);
});
