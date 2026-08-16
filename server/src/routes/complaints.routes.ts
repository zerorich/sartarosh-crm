import { Router } from "express";
import { postComplaint } from "../controllers/complaint.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { createComplaintSchema } from "../validators/complaint.validator";

export const complaintsRouter = Router();

/**
 * @openapi
 * /api/complaints:
 *   post:
 *     tags: [Complaints]
 *     summary: Submit a complaint
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComplaintCreate'
 *     responses:
 *       201:
 *         description: Complaint submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
complaintsRouter.post(
  "/",
  authenticate,
  authorize("CLIENT"),
  validate(createComplaintSchema),
  postComplaint,
);
