import type { Request, Response } from "express";
import {
  createReview,
  listBarberReviews,
  listSalonReviews,
  updateReview,
} from "../services/review.service";
import { created, ok, paginated } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { routeParam, routeQuery } from "../utils/route-params";

export const postReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await createReview({
    clientId: req.user!.id,
    bookingId: req.body.bookingId,
    barberRating: req.body.barberRating,
    salonRating: req.body.salonRating,
    serviceRating: req.body.serviceRating,
    comment: req.body.comment,
  });
  return created(res, review);
});

export const patchReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await updateReview({
    reviewId: routeParam(req),
    clientId: req.user!.id,
    barberRating: req.body.barberRating,
    salonRating: req.body.salonRating,
    serviceRating: req.body.serviceRating,
    comment: req.body.comment,
  });
  return ok(res, review);
});

export const getSalonReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = routeQuery<{ page: number; limit: number }>(req);
  const result = await listSalonReviews(routeParam(req), page, limit);
  return paginated(res, result);
});

export const getBarberReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = routeQuery<{ page: number; limit: number }>(req);
  const result = await listBarberReviews(routeParam(req), page, limit);
  return paginated(res, result);
});
