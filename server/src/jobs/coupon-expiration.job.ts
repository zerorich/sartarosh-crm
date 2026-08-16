import { prisma } from "../config/prisma";
import { writeAudit } from "../services/audit.service";

export async function processCouponExpiration(now = new Date()) {
  const expired = await prisma.coupon.findMany({
    where: {
      usedAt: null,
      expiresAt: { lt: now },
    },
    select: { id: true, clientId: true, salonId: true, expiresAt: true },
  });

  if (expired.length === 0) {
    return { expiredCount: 0, newlyMarked: 0 };
  }

  const already = await prisma.auditLog.findMany({
    where: {
      action: "COUPON_EXPIRED",
      entityType: "Coupon",
      entityId: { in: expired.map((coupon) => coupon.id) },
    },
    select: { entityId: true },
  });
  const handled = new Set(already.map((row) => row.entityId));
  const fresh = expired.filter((coupon) => !handled.has(coupon.id));

  for (const coupon of fresh) {
    await writeAudit({
      action: "COUPON_EXPIRED",
      entityType: "Coupon",
      entityId: coupon.id,
      metadata: {
        clientId: coupon.clientId,
        salonId: coupon.salonId,
        expiresAt: coupon.expiresAt.toISOString(),
      },
    });
  }

  return { expiredCount: expired.length, newlyMarked: fresh.length };
}
