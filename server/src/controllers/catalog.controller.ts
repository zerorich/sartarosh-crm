import type { Request, Response } from "express";
import * as catalogService from "../services/catalog.service";
import { ok, created } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { routeBody, routeParam } from "../utils/route-params";

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const service = await catalogService.createService(routeParam(req), req.body);
  return created(res, service);
});

export const listServices = asyncHandler(async (req: Request, res: Response) => {
  const services = await catalogService.listSalonServices(routeParam(req), req.user);
  return ok(res, services);
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const service = await catalogService.updateService(routeParam(req), req.body);
  return ok(res, service);
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const service = await catalogService.deleteService(routeParam(req));
  return ok(res, service);
});

export const changePrice = asyncHandler(async (req: Request, res: Response) => {
  const { price } = routeBody<{ price: number }>(req);
  const service = await catalogService.changeServicePrice(routeParam(req), price, req.user!.id);
  return ok(res, service);
});

export const priceHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await catalogService.getPriceHistory(routeParam(req), req.user);
  return ok(res, history);
});
