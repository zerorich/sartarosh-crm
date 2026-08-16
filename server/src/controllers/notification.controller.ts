import type { Request, Response } from "express";
import { listNotifications, markRead } from "../services/notification.service";
import { ok, paginated } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { routeParam, routeQuery } from "../utils/route-params";

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = routeQuery<{ page: number; limit: number }>(req);
  const result = await listNotifications(req.user!.id, page, limit);
  return paginated(res, result);
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await markRead(req.user!.id, routeParam(req));
  return ok(res, notification);
});
