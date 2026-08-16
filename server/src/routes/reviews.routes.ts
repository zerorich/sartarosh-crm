import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  getBarberReviews,
  getSalonReviews,
  patchReview,
  postReview,
} from "../controllers/review.controller";
import {
  barberIdParamSchema,
  createReviewSchema,
  reviewIdParamSchema,
  reviewListQuerySchema,
  salonIdParamSchema,
  updateReviewSchema,
} from "../validators/review.validator";

export const reviewsRouter = Router();

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a completed booking
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreate'
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
reviewsRouter.post(
  "/",
  authenticate,
  authorize("CLIENT"),
  validate(createReviewSchema),
  postReview,
);

/**
 * @openapi
 * /api/reviews/{id}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Update own review within edit window
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewUpdate'
 *     responses:
 *       200:
 *         description: Review updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
reviewsRouter.patch(
  "/:id",
  authenticate,
  authorize("CLIENT"),
  validate(reviewIdParamSchema, "params"),
  validate(updateReviewSchema),
  patchReview,
);

export const salonReviewsRouter = Router({ mergeParams: true });

/**
 * @openapi
 * /api/salons/{id}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List salon reviews
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Paginated salon reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
salonReviewsRouter.get(
  "/",
  validate(salonIdParamSchema, "params"),
  validate(reviewListQuerySchema, "query"),
  getSalonReviews,
);

export const barberReviewsRouter = Router({ mergeParams: true });

/**
 * @openapi
 * /api/barbers/{id}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List barber reviews
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Paginated barber reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
barberReviewsRouter.get(
  "/",
  validate(barberIdParamSchema, "params"),
  validate(reviewListQuerySchema, "query"),
  getBarberReviews,
);
