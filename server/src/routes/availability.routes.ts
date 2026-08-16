import { Router } from "express";
import { getAvailability } from "../controllers/availability.controller";
import { validate } from "../middleware/validate";
import { availabilityQuerySchema } from "../validators/availability.validator";

export const availabilityRouter = Router();

/**
 * @openapi
 * /api/availability:
 *   get:
 *     tags: [Availability]
 *     summary: List bookable time slots for a salon/barber/service on a given date
 *     parameters:
 *       - name: salonId
 *         in: query
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - name: barberId
 *         in: query
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - name: serviceId
 *         in: query
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - name: date
 *         in: query
 *         required: true
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Available slots
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
availabilityRouter.get("/", validate(availabilityQuerySchema, "query"), getAvailability);
