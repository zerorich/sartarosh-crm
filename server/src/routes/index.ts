import { Router } from "express";
import { adminRouter } from "./admin.routes";
import { authRouter } from "./auth.routes";
import { availabilityRouter } from "./availability.routes";
import { bookingsRouter } from "./bookings.routes";
import { catalogRouter } from "./catalog.routes";
import { complaintsRouter } from "./complaints.routes";
import { financeRouter } from "./finance.routes";
import { notificationsRouter } from "./notifications.routes";
import { paymentsRouter } from "./payments.routes";
import { reviewsRouter } from "./reviews.routes";
import { salonRouter } from "./salon.routes";
import { staffRouter } from "./staff.routes";
import { uploadsRouter } from "./uploads.routes";
import { usersRouter } from "./users.routes";

export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      name: "Sartarosh API",
      version: "1.0.0",
      routes: {
        auth: "/api/auth",
        users: "/api/users/me",
        salons: "/api/salons",
        staff: "/api/salons/:id/staff, /api/staff/:id, /api/barbers/:id",
        catalog: "/api/salons/:id/services, /api/services/:id",
        bookings: "/api/bookings",
        payments: "/api/payments/create, /api/payments/:id",
        reviews: "/api/reviews, /api/salons/:id/reviews, /api/barbers/:id/reviews",
        finance: "/api/finance",
        complaints: "/api/complaints",
        admin: "/api/admin, /api/admin/complaints",
        docs: "/api/docs",
        notifications: "/api/notifications",
      },
    },
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/salons", salonRouter);
apiRouter.use(staffRouter);
apiRouter.use(catalogRouter);
apiRouter.use("/bookings", bookingsRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/finance", financeRouter);
apiRouter.use("/complaints", complaintsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/notifications", notificationsRouter);
apiRouter.use("/availability", availabilityRouter);
apiRouter.use("/uploads", uploadsRouter);
