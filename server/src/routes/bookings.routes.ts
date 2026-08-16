import { Router } from "express";
import {
  getBooking,
  getBookings,
  postArrive,
  postBooking,
  postCancel,
  postComplete,
  postNoShow,
  postStart,
} from "../controllers/booking.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { requireOwnership } from "../middleware/require-ownership";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { idParamSchema } from "../validators/common";
import {
  cancelBookingSchema,
  createBookingSchema,
  listBookingsQuerySchema,
} from "../validators/booking.validator";

export const bookingsRouter = Router();

bookingsRouter.use(authenticate);

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     tags: [Booking]
 *     summary: Create a booking
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingCreate'
 *     responses:
 *       201:
 *         description: Booking created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   get:
 *     tags: [Booking]
 *     summary: List bookings for current user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *       - name: salonId
 *         in: query
 *         schema: { type: string, format: uuid }
 *       - name: from
 *         in: query
 *         schema: { type: string, format: date-time }
 *       - name: to
 *         in: query
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Paginated bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
bookingsRouter.post(
  "/",
  authorize("CLIENT"),
  validate(createBookingSchema),
  asyncHandler(postBooking),
);

bookingsRouter.get("/", validate(listBookingsQuerySchema, "query"), asyncHandler(getBookings));

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     tags: [Booking]
 *     summary: Get booking by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Booking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
bookingsRouter.get(
  "/:id",
  validate(idParamSchema, "params"),
  requireOwnership("booking"),
  asyncHandler(getBooking),
);

/**
 * @openapi
 * /api/bookings/{id}/cancel:
 *   post:
 *     tags: [Booking]
 *     summary: Cancel a booking
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingCancel'
 *     responses:
 *       200:
 *         description: Booking cancelled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
bookingsRouter.post(
  "/:id/cancel",
  validate(idParamSchema, "params"),
  requireOwnership("booking"),
  validate(cancelBookingSchema),
  asyncHandler(postCancel),
);

/**
 * @openapi
 * /api/bookings/{id}/arrive:
 *   post:
 *     tags: [Booking]
 *     summary: Mark client arrived
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Booking marked arrived
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
bookingsRouter.post(
  "/:id/arrive",
  validate(idParamSchema, "params"),
  requireOwnership("booking"),
  asyncHandler(postArrive),
);

/**
 * @openapi
 * /api/bookings/{id}/start:
 *   post:
 *     tags: [Booking]
 *     summary: Start a booking
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Booking started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
bookingsRouter.post(
  "/:id/start",
  validate(idParamSchema, "params"),
  requireOwnership("booking"),
  asyncHandler(postStart),
);

/**
 * @openapi
 * /api/bookings/{id}/complete:
 *   post:
 *     tags: [Booking]
 *     summary: Complete a booking
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Booking completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
bookingsRouter.post(
  "/:id/complete",
  validate(idParamSchema, "params"),
  requireOwnership("booking"),
  asyncHandler(postComplete),
);

/**
 * @openapi
 * /api/bookings/{id}/no-show:
 *   post:
 *     tags: [Booking]
 *     summary: Mark booking as no-show
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Booking marked no-show
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
bookingsRouter.post(
  "/:id/no-show",
  validate(idParamSchema, "params"),
  requireOwnership("booking"),
  asyncHandler(postNoShow),
);
