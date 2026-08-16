import { Router } from "express";
import {
  getPayment,
  postCreatePayment,
  postRefundPayment,
  postVerifyPayment,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/async-handler";
import { idParamSchema } from "../validators/common";
import {
  createPaymentSchema,
  refundPaymentSchema,
  verifyPaymentSchema,
} from "../validators/payment.validator";

export const paymentsRouter = Router();

paymentsRouter.use(authenticate);

/**
 * @openapi
 * /api/payments/create:
 *   post:
 *     tags: [Payments]
 *     summary: Create a payment for a booking
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentCreate'
 *     responses:
 *       201:
 *         description: Payment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
paymentsRouter.post("/create", validate(createPaymentSchema), asyncHandler(postCreatePayment));

/**
 * @openapi
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Payment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
paymentsRouter.get("/:id", validate(idParamSchema, "params"), asyncHandler(getPayment));

/**
 * @openapi
 * /api/payments/{id}/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify a payment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentVerify'
 *     responses:
 *       200:
 *         description: Payment verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
paymentsRouter.post(
  "/:id/verify",
  validate(idParamSchema, "params"),
  validate(verifyPaymentSchema),
  asyncHandler(postVerifyPayment),
);

/**
 * @openapi
 * /api/payments/{id}/refund:
 *   post:
 *     tags: [Payments]
 *     summary: Refund a payment
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRefund'
 *     responses:
 *       200:
 *         description: Payment refunded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
paymentsRouter.post(
  "/:id/refund",
  validate(idParamSchema, "params"),
  validate(refundPaymentSchema),
  asyncHandler(postRefundPayment),
);
