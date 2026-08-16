import { Router } from "express";
import {
  getAdminReports,
  getBarber,
  getBarbers,
  getBooking,
  getBookings,
  getPayment,
  getPayments,
  getReviews,
  getSalon,
  getSalons,
  getSettings,
  getUser,
  getUsers,
  patchApproveSalon,
  patchBlockSalon,
  patchBlockUser,
  patchHideReview,
  patchRejectSalon,
  patchRestoreReview,
  patchSettings,
  patchUnblockUser,
  refundPaymentAdmin,
  removeReview,
} from "../controllers/admin.controller";
import { getComplaint, getComplaints, patchComplaint } from "../controllers/complaint.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import {
  adminBarberListQuerySchema,
  adminBookingListQuerySchema,
  adminIdParamSchema,
  adminPaymentListQuerySchema,
  adminReviewListQuerySchema,
  adminSalonListQuerySchema,
  adminSettingsPatchSchema,
  adminUserListQuerySchema,
  blockSalonSchema,
  blockUserSchema,
  rejectSalonSchema,
} from "../validators/admin.validator";
import {
  complaintIdParamSchema,
  complaintListQuerySchema,
  updateComplaintSchema,
} from "../validators/complaint.validator";
import { refundPaymentSchema } from "../validators/payment.validator";

export const adminRouter = Router();

adminRouter.use(authenticate, authorize("ADMIN", "SUPER_ADMIN"));

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags: [Users, Admin]
 *     summary: List users
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - name: role
 *         in: query
 *         schema: { type: string, enum: [CLIENT, BARBER, OWNER, ADMIN, SUPER_ADMIN] }
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
adminRouter.get("/users", validate(adminUserListQuerySchema, "query"), getUsers);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     tags: [Users, Admin]
 *     summary: Get user by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.get("/users/:id", validate(adminIdParamSchema, "params"), getUser);

/**
 * @openapi
 * /api/admin/users/{id}/block:
 *   patch:
 *     tags: [Users, Admin]
 *     summary: Block or unblock user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockUser'
 *     responses:
 *       200:
 *         description: User block state updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.patch(
  "/users/:id/block",
  validate(adminIdParamSchema, "params"),
  validate(blockUserSchema),
  patchBlockUser,
);

/**
 * @openapi
 * /api/admin/users/{id}/unblock:
 *   patch:
 *     tags: [Users, Admin]
 *     summary: Unblock user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User unblocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.patch("/users/:id/unblock", validate(adminIdParamSchema, "params"), patchUnblockUser);

/**
 * @openapi
 * /api/admin/salons:
 *   get:
 *     tags: [Admin]
 *     summary: List salons
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - name: status
 *         in: query
 *         schema: { type: string, enum: [PENDING, ACTIVE, REJECTED, BLOCKED] }
 *     responses:
 *       200:
 *         description: Paginated salons
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
adminRouter.get("/salons", validate(adminSalonListQuerySchema, "query"), getSalons);

/**
 * @openapi
 * /api/admin/salons/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get salon by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Salon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.get("/salons/:id", validate(adminIdParamSchema, "params"), getSalon);

/**
 * @openapi
 * /api/admin/salons/{id}/approve:
 *   patch:
 *     tags: [Admin]
 *     summary: Approve salon
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Salon approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.patch("/salons/:id/approve", validate(adminIdParamSchema, "params"), patchApproveSalon);

/**
 * @openapi
 * /api/admin/salons/{id}/reject:
 *   patch:
 *     tags: [Admin]
 *     summary: Reject salon
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectSalon'
 *     responses:
 *       200:
 *         description: Salon rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.patch(
  "/salons/:id/reject",
  validate(adminIdParamSchema, "params"),
  validate(rejectSalonSchema),
  patchRejectSalon,
);

/**
 * @openapi
 * /api/admin/salons/{id}/block:
 *   patch:
 *     tags: [Admin]
 *     summary: Block salon
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockSalon'
 *     responses:
 *       200:
 *         description: Salon blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.patch(
  "/salons/:id/block",
  validate(adminIdParamSchema, "params"),
  validate(blockSalonSchema),
  patchBlockSalon,
);

/**
 * @openapi
 * /api/admin/bookings:
 *   get:
 *     tags: [Admin]
 *     summary: List bookings
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - name: status
 *         in: query
 *         schema: { type: string }
 *       - name: salonId
 *         in: query
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Paginated bookings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
adminRouter.get("/bookings", validate(adminBookingListQuerySchema, "query"), getBookings);

/**
 * @openapi
 * /api/admin/bookings/{id}:
 *   get:
 *     tags: [Admin]
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
adminRouter.get("/bookings/:id", validate(adminIdParamSchema, "params"), getBooking);

/**
 * @openapi
 * /api/admin/payments:
 *   get:
 *     tags: [Admin]
 *     summary: List payments
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - name: status
 *         in: query
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated payments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
adminRouter.get("/payments", validate(adminPaymentListQuerySchema, "query"), getPayments);

/**
 * @openapi
 * /api/admin/payments/{id}:
 *   get:
 *     tags: [Admin]
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
adminRouter.get("/payments/:id", validate(adminIdParamSchema, "params"), getPayment);

/**
 * @openapi
 * /api/admin/payments/{id}/refund:
 *   patch:
 *     tags: [Admin]
 *     summary: Refund a payment (admin)
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
adminRouter.patch(
  "/payments/:id/refund",
  validate(adminIdParamSchema, "params"),
  validate(refundPaymentSchema),
  refundPaymentAdmin,
);

/**
 * @openapi
 * /api/admin/reviews:
 *   get:
 *     tags: [Admin]
 *     summary: List reviews
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - name: includeHidden
 *         in: query
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Paginated reviews
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
adminRouter.get("/reviews", validate(adminReviewListQuerySchema, "query"), getReviews);

/**
 * @openapi
 * /api/admin/reviews/{id}/hide:
 *   patch:
 *     tags: [Admin]
 *     summary: Hide review
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Review hidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.patch("/reviews/:id/hide", validate(adminIdParamSchema, "params"), patchHideReview);

/**
 * @openapi
 * /api/admin/reviews/{id}/restore:
 *   patch:
 *     tags: [Admin]
 *     summary: Restore hidden review
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Review restored
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.patch("/reviews/:id/restore", validate(adminIdParamSchema, "params"), patchRestoreReview);

/**
 * @openapi
 * /api/admin/reviews/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete review permanently
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Review deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.delete("/reviews/:id", validate(adminIdParamSchema, "params"), removeReview);

/**
 * @openapi
 * /api/admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: Platform reports summary
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Reports
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.get("/reports", getAdminReports);

/**
 * @openapi
 * /api/admin/settings:
 *   get:
 *     tags: [Admin]
 *     summary: Get platform settings
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   patch:
 *     tags: [Admin]
 *     summary: Update platform settings
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminSettings'
 *     responses:
 *       200:
 *         description: Settings updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.get("/settings", getSettings);
adminRouter.patch("/settings", validate(adminSettingsPatchSchema), patchSettings);

/**
 * @openapi
 * /api/admin/barbers:
 *   get:
 *     tags: [Admin]
 *     summary: List barbers
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *       - name: salonId
 *         in: query
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Paginated barbers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
adminRouter.get("/barbers", validate(adminBarberListQuerySchema, "query"), getBarbers);

/**
 * @openapi
 * /api/admin/barbers/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get barber by id
 *     security: [{ bearerAuth: [] }]
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
adminRouter.get("/barbers/:id", validate(adminIdParamSchema, "params"), getBarber);

/**
 * @openapi
 * /api/admin/complaints:
 *   get:
 *     tags: [Admin]
 *     summary: List complaints
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/PageQuery'
 *       - $ref: '#/components/parameters/LimitQuery'
 *       - name: status
 *         in: query
 *         schema: { type: string, enum: [OPEN, IN_REVIEW, RESOLVED, REJECTED] }
 *     responses:
 *       200:
 *         description: Paginated complaints
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Paginated'
 */
adminRouter.get("/complaints", validate(complaintListQuerySchema, "query"), getComplaints);

/**
 * @openapi
 * /api/admin/complaints/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get complaint by id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Complaint
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *   patch:
 *     tags: [Admin]
 *     summary: Update complaint status
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ComplaintUpdate'
 *     responses:
 *       200:
 *         description: Complaint updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
adminRouter.get("/complaints/:id", validate(complaintIdParamSchema, "params"), getComplaint);
adminRouter.patch(
  "/complaints/:id",
  validate(complaintIdParamSchema, "params"),
  validate(updateComplaintSchema),
  patchComplaint,
);
