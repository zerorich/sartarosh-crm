import { Router } from "express";
import * as staffController from "../controllers/staff.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { optionalAuthenticate } from "../middleware/optional-authenticate";
import { requireOwnership } from "../middleware/require-ownership";
import { validate } from "../middleware/validate";
import {
  inviteStaffSchema,
  salonIdParamSchema,
  staffIdParamSchema,
  updateStaffSchema,
  barberIdParamSchema,
} from "../validators/staff.validator";
import { barberReviewsRouter } from "./reviews.routes";

export const staffRouter = Router();

/**
 * @openapi
 * /api/salons/{id}/staff:
 *   post:
 *     tags: [Barbers]
 *     summary: Invite a barber to a salon
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InviteStaff'
 *     responses:
 *       201:
 *         description: Staff invited
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   get:
 *     tags: [Barbers]
 *     summary: List salon staff
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Staff list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
staffRouter.post(
  "/salons/:id/staff",
  authenticate,
  authorize("OWNER"),
  validate(salonIdParamSchema, "params"),
  validate(inviteStaffSchema),
  requireOwnership("salon"),
  staffController.inviteStaff,
);

staffRouter.get(
  "/salons/:id/staff",
  optionalAuthenticate,
  validate(salonIdParamSchema, "params"),
  staffController.listStaff,
);

/**
 * @openapi
 * /api/staff/{id}:
 *   patch:
 *     tags: [Barbers]
 *     summary: Update staff membership
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStaff'
 *     responses:
 *       200:
 *         description: Staff updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   delete:
 *     tags: [Barbers]
 *     summary: Remove staff from salon
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Staff removed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
staffRouter.patch(
  "/staff/:id",
  authenticate,
  authorize("OWNER", "BARBER"),
  validate(staffIdParamSchema, "params"),
  validate(updateStaffSchema),
  requireOwnership("staff"),
  staffController.updateStaff,
);

staffRouter.delete(
  "/staff/:id",
  authenticate,
  authorize("OWNER"),
  validate(staffIdParamSchema, "params"),
  requireOwnership("staff"),
  staffController.deleteStaff,
);

staffRouter.use("/barbers/:id/reviews", barberReviewsRouter);

/**
 * @openapi
 * /api/barbers/{id}:
 *   get:
 *     tags: [Barbers]
 *     summary: Get barber public profile
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Barber
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
staffRouter.get("/barbers/:id", validate(barberIdParamSchema, "params"), staffController.getBarber);
