import { Router } from "express";
import * as salonController from "../controllers/salon.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { optionalAuthenticate } from "../middleware/optional-authenticate";
import { requireOwnership } from "../middleware/require-ownership";
import { validate } from "../middleware/validate";
import { idParamSchema } from "../validators/common";
import {
  createSalonSchema,
  listSalonsSchema,
  nearbySalonsSchema,
  updateSalonSchema,
} from "../validators/salon.validator";
import { salonReviewsRouter } from "./reviews.routes";

export const salonRouter = Router();

/**
 * @openapi
 * /api/salons:
 *   post:
 *     tags: [Salons]
 *     summary: Create a salon
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalonCreate'
 *     responses:
 *       201:
 *         description: Salon created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   get:
 *     tags: [Salons]
 *     summary: List salons
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Paginated salons
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
salonRouter.post(
  "/",
  authenticate,
  authorize("OWNER"),
  validate(createSalonSchema),
  salonController.createSalon,
);

/**
 * @openapi
 * /api/salons/nearby:
 *   get:
 *     tags: [Salons]
 *     summary: Find salons near coordinates
 *     parameters:
 *       - name: lat
 *         in: query
 *         required: true
 *         schema: { type: number, minimum: -90, maximum: 90 }
 *       - name: lng
 *         in: query
 *         required: true
 *         schema: { type: number, minimum: -180, maximum: 180 }
 *       - name: radius
 *         in: query
 *         schema: { type: number, minimum: 0, maximum: 100 }
 *     responses:
 *       200:
 *         description: Nearby salons
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
salonRouter.get("/nearby", validate(nearbySalonsSchema, "query"), salonController.nearbySalons);

salonRouter.get(
  "/",
  optionalAuthenticate,
  validate(listSalonsSchema, "query"),
  salonController.listSalons,
);

salonRouter.use("/:id/reviews", salonReviewsRouter);

/**
 * @openapi
 * /api/salons/{id}:
 *   get:
 *     tags: [Salons]
 *     summary: Get salon by id
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Salon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   patch:
 *     tags: [Salons]
 *     summary: Update salon
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SalonUpdate'
 *     responses:
 *       200:
 *         description: Salon updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   delete:
 *     tags: [Salons]
 *     summary: Delete salon
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Salon deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
salonRouter.get(
  "/:id",
  optionalAuthenticate,
  validate(idParamSchema, "params"),
  salonController.getSalon,
);

salonRouter.patch(
  "/:id",
  authenticate,
  authorize("OWNER"),
  validate(idParamSchema, "params"),
  validate(updateSalonSchema),
  requireOwnership("salon"),
  salonController.updateSalon,
);

salonRouter.delete(
  "/:id",
  authenticate,
  authorize("OWNER"),
  validate(idParamSchema, "params"),
  requireOwnership("salon"),
  salonController.deleteSalon,
);
