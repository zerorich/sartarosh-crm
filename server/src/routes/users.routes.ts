import { Router } from "express";
import {
  deleteSavedSalon,
  getMe,
  getMyCoupons,
  getMyReviews,
  getMySavedSalons,
  patchMe,
  putSavedSalon,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { savedSalonParamSchema, updateMeSchema } from "../validators/user.validator";

export const usersRouter = Router();

usersRouter.use(authenticate);

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current authenticated user's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
usersRouter.get("/me", getMe);

/**
 * @openapi
 * /api/users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update current authenticated user's profile (name, avatar)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               avatarUrl: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
usersRouter.patch("/me", validate(updateMeSchema), patchMe);

/**
 * @openapi
 * /api/users/me/coupons:
 *   get:
 *     tags: [Users]
 *     summary: List current client's active (unused, unexpired) coupons
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Active coupons
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
usersRouter.get("/me/coupons", getMyCoupons);

/**
 * @openapi
 * /api/users/me/reviews:
 *   get:
 *     tags: [Users]
 *     summary: List reviews written by the current client
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: My reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
usersRouter.get("/me/reviews", getMyReviews);

/**
 * @openapi
 * /api/users/me/saved-salons:
 *   get:
 *     tags: [Users]
 *     summary: List salons saved by the current client
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Saved salons
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
usersRouter.get("/me/saved-salons", getMySavedSalons);

/**
 * @openapi
 * /api/users/me/saved-salons/{salonId}:
 *   put:
 *     tags: [Users]
 *     summary: Save a salon for the current client
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: salonId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Salon saved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   delete:
 *     tags: [Users]
 *     summary: Remove a salon from the current client's saved list
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - name: salonId
 *         in: path
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Salon removed from saved list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
usersRouter.put(
  "/me/saved-salons/:salonId",
  validate(savedSalonParamSchema, "params"),
  putSavedSalon,
);

usersRouter.delete(
  "/me/saved-salons/:salonId",
  validate(savedSalonParamSchema, "params"),
  deleteSavedSalon,
);
