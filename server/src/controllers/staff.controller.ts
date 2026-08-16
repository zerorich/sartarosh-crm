import type { Request, Response } from "express";
import * as staffService from "../services/staff.service";
import { ok, created } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { routeParam } from "../utils/route-params";

export const inviteStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.inviteStaff(routeParam(req), req.body);
  return created(res, staff);
});

export const listStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.listSalonStaff(routeParam(req), req.user);
  return ok(res, staff);
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.updateStaff(routeParam(req), req.body, req.user!);
  return ok(res, staff);
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await staffService.removeStaff(routeParam(req));
  return ok(res, staff);
});

export const getBarber = asyncHandler(async (req: Request, res: Response) => {
  const barber = await staffService.getBarberById(routeParam(req));
  return ok(res, barber);
});
