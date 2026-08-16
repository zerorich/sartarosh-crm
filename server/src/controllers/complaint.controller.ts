import type { ComplaintStatus } from "@prisma/client";
import type { Request, Response } from "express";
import {
  createComplaint,
  getComplaintById,
  listComplaints,
  updateComplaint,
} from "../services/complaint.service";
import { created, ok, paginated } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { routeParam, routeQuery } from "../utils/route-params";

export const postComplaint = asyncHandler(async (req: Request, res: Response) => {
  const complaint = await createComplaint({
    clientId: req.user!.id,
    subject: req.body.subject,
    body: req.body.body,
    salonId: req.body.salonId,
    bookingId: req.body.bookingId,
  });
  return created(res, complaint);
});

export const getComplaints = asyncHandler(async (req: Request, res: Response) => {
  const query = routeQuery<{ page: number; limit: number; status?: string }>(req);
  const result = await listComplaints({
    page: query.page,
    limit: query.limit,
    status: query.status as ComplaintStatus | undefined,
  });
  return paginated(res, result);
});

export const getComplaint = asyncHandler(async (req: Request, res: Response) => {
  const complaint = await getComplaintById(routeParam(req));
  return ok(res, complaint);
});

export const patchComplaint = asyncHandler(async (req: Request, res: Response) => {
  const complaint = await updateComplaint({
    complaintId: routeParam(req),
    adminId: req.user!.id,
    status: req.body.status,
    adminNote: req.body.adminNote,
  });
  return ok(res, complaint);
});
