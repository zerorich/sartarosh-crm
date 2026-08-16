import type { Request, Response } from "express";
import * as userService from "../services/user.service";
import { ok } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { routeParam } from "../utils/route-params";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const me = await userService.getMe(req.user!.id);
  return ok(res, me);
});

export const patchMe = asyncHandler(async (req: Request, res: Response) => {
  const me = await userService.updateMe(req.user!.id, req.body);
  return ok(res, me);
});

export const getMyCoupons = asyncHandler(async (req: Request, res: Response) => {
  const coupons = await userService.getMyCoupons(req.user!.id);
  return ok(res, coupons);
});

export const getMyReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await userService.getMyReviews(req.user!.id);
  return ok(res, reviews);
});

export const getMySavedSalons = asyncHandler(async (req: Request, res: Response) => {
  const salons = await userService.listSavedSalons(req.user!.id);
  return ok(res, salons);
});

export const putSavedSalon = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.saveSalon(req.user!.id, routeParam(req, "salonId"));
  return ok(res, result);
});

export const deleteSavedSalon = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.unsaveSalon(req.user!.id, routeParam(req, "salonId"));
  return ok(res, result);
});
