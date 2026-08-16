import { Router } from "express";
import { getNotifications, markNotificationRead } from "../controllers/notification.controller";
import { authenticate } from "../middleware/authenticate";
import { validate } from "../middleware/validate";
import { paginationSchema } from "../utils/pagination";
import { idParamSchema } from "../validators/common";

export const notificationsRouter = Router();

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List user notifications
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *     responses:
 *       200:
 *         description: Paginated notifications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
notificationsRouter.get("/", authenticate, validate(paginationSchema, "query"), getNotifications);

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Notification marked read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
notificationsRouter.patch(
  "/:id/read",
  authenticate,
  validate(idParamSchema, "params"),
  markNotificationRead,
);
