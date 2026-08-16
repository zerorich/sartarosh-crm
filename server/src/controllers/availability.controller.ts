import type { Request, Response } from "express";
import { getAvailableSlots } from "../services/availability.service";
import { ok } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { routeQuery } from "../utils/route-params";

export const getAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { salonId, barberId, serviceId, date } = routeQuery<{
    salonId: string;
    barberId: string;
    serviceId: string;
    date: Date;
  }>(req);

  const slots = await getAvailableSlots({ salonId, barberId, serviceId, date });
  return ok(res, { date: date.toISOString().slice(0, 10), slots });
});
