import { Router } from "express";
import * as catalogController from "../controllers/catalog.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { optionalAuthenticate } from "../middleware/optional-authenticate";
import { requireOwnership } from "../middleware/require-ownership";
import { validate } from "../middleware/validate";
import {
  changePriceSchema,
  createServiceSchema,
  salonIdParamSchema,
  serviceIdParamSchema,
  updateServiceSchema,
} from "../validators/catalog.validator";

export const catalogRouter = Router();

/**
 * @openapi
 * /api/salons/{id}/services:
 *   post:
 *     tags: [Services]
 *     summary: Create a salon service
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceCreate'
 *     responses:
 *       201:
 *         description: Service created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   get:
 *     tags: [Services]
 *     summary: List salon services
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Services
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
catalogRouter.post(
  "/salons/:id/services",
  authenticate,
  authorize("OWNER"),
  validate(salonIdParamSchema, "params"),
  validate(createServiceSchema),
  requireOwnership("salon"),
  catalogController.createService,
);

catalogRouter.get(
  "/salons/:id/services",
  optionalAuthenticate,
  validate(salonIdParamSchema, "params"),
  catalogController.listServices,
);

/**
 * @openapi
 * /api/services/{id}:
 *   patch:
 *     tags: [Services]
 *     summary: Update a service
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceUpdate'
 *     responses:
 *       200:
 *         description: Service updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   delete:
 *     tags: [Services]
 *     summary: Deactivate a service
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Service deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
catalogRouter.patch(
  "/services/:id",
  authenticate,
  authorize("OWNER"),
  validate(serviceIdParamSchema, "params"),
  validate(updateServiceSchema),
  requireOwnership("service"),
  catalogController.updateService,
);

catalogRouter.delete(
  "/services/:id",
  authenticate,
  authorize("OWNER"),
  validate(serviceIdParamSchema, "params"),
  requireOwnership("service"),
  catalogController.deleteService,
);

/**
 * @openapi
 * /api/services/{id}/price:
 *   post:
 *     tags: [Services]
 *     summary: Change service price
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePrice'
 *     responses:
 *       200:
 *         description: Price updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
catalogRouter.post(
  "/services/:id/price",
  authenticate,
  authorize("OWNER"),
  validate(serviceIdParamSchema, "params"),
  validate(changePriceSchema),
  requireOwnership("service"),
  catalogController.changePrice,
);

/**
 * @openapi
 * /api/services/{id}/price-history:
 *   get:
 *     tags: [Services]
 *     summary: Get service price history
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Price history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
catalogRouter.get(
  "/services/:id/price-history",
  authenticate,
  authorize("OWNER", "BARBER", "ADMIN", "SUPER_ADMIN"),
  validate(serviceIdParamSchema, "params"),
  catalogController.priceHistory,
);
