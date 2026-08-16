import type { Request, Response } from "express";
import * as userService from "../services/user.service";
import { ok } from "../utils/api-response";

export async function getMe(req: Request, res: Response) {
  const profile = await userService.getMyProfile(req.user!.id);
  return ok(res, profile);
}

export async function updateMe(req: Request, res: Response) {
  const profile = await userService.updateMyProfile(req.user!.id, req.body);
  return ok(res, profile);
}
