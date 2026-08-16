import { beforeEach, describe, expect, it, vi } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const mockPrisma = vi.hoisted(() => ({
  booking: { findUnique: vi.fn() },
  payment: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("../src/config/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../src/services/notification.service", () => ({
  createNotification: vi.fn().mockResolvedValue({}),
}));
vi.mock("../src/services/audit.service", () => ({
  writeAudit: vi.fn().mockResolvedValue({}),
}));
vi.mock("../src/services/booking.service", () => ({
  confirmBookingAfterDeposit: vi.fn().mockResolvedValue(undefined),
}));

import { createPaymentIntent, verifyPaymentSignature } from "../src/integrations/payment.provider";
import { createPayment, refundPayment, verifyPayment } from "../src/services/payment.service";
import { confirmBookingAfterDeposit } from "../src/services/booking.service";
import { writeAudit } from "../src/services/audit.service";
import { AppError } from "../src/utils/app-error";

describe("PaymentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates deposit payment from booking snapshot amounts", async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      id: "booking-1",
      clientId: "client-1",
      barberId: "barber-1",
      price: new Decimal(100),
      depositAmount: new Decimal(25),
      remainingAmount: new Decimal(75),
      salon: { ownerId: "owner-1" },
    });
    mockPrisma.payment.findFirst.mockResolvedValue(null);
    mockPrisma.payment.create.mockResolvedValue({
      id: "pay-1",
      bookingId: "booking-1",
      amount: new Decimal(25),
      method: "ONLINE",
      type: "DEPOSIT",
      status: "PENDING",
    });
    mockPrisma.payment.update.mockResolvedValue({});

    const result = await createPayment({
      bookingId: "booking-1",
      method: "ONLINE",
      type: "DEPOSIT",
      userId: "client-1",
      role: "CLIENT",
    });

    expect(result.payment.amount).toBe(25);
    expect(result.intent?.signature).toBeDefined();
  });

  it("verifies online payment with server-side signature", async () => {
    const amount = 25;
    const paymentId = "pay-1";
    const intent = createPaymentIntent(paymentId, amount);

    mockPrisma.payment.findUnique.mockResolvedValue({
      id: paymentId,
      bookingId: "booking-1",
      amount: new Decimal(amount),
      method: "ONLINE",
      type: "DEPOSIT",
      status: "PENDING",
      signature: intent.signature,
      booking: {
        clientId: "client-1",
        barberId: "barber-1",
        salon: { ownerId: "owner-1" },
      },
    });
    mockPrisma.payment.update.mockResolvedValue({
      id: paymentId,
      amount: new Decimal(amount),
      status: "PAID",
    });

    const verified = await verifyPayment({
      paymentId,
      signature: intent.signature,
      actorId: "client-1",
      role: "CLIENT",
    });

    expect(verified.status).toBe("PAID");
    expect(verifyPaymentSignature(paymentId, amount, intent.signature)).toBe(true);
    expect(confirmBookingAfterDeposit).toHaveBeenCalledWith("booking-1");
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "client-1",
        action: "PAYMENT_VERIFIED",
        entityType: "Payment",
        entityId: paymentId,
      }),
    );
  });

  it("lets an owner refund only payments for their salon", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-1",
      bookingId: "booking-1",
      status: "PAID",
      amount: new Decimal(25),
      booking: { clientId: "client-1", salon: { ownerId: "owner-1" } },
    });
    mockPrisma.payment.update.mockResolvedValue({
      id: "pay-1",
      amount: new Decimal(25),
      status: "REFUNDED",
    });

    const refunded = await refundPayment("pay-1", {
      id: "user-owner-1",
      role: "OWNER",
      ownerProfileId: "owner-1",
    });

    expect(refunded.status).toBe("REFUNDED");
    expect(writeAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "user-owner-1",
        action: "PAYMENT_REFUNDED",
        entityId: "pay-1",
      }),
    );
  });

  it("forbids an owner from refunding another salon payment", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-1",
      bookingId: "booking-1",
      status: "PAID",
      amount: new Decimal(25),
      booking: { clientId: "client-1", salon: { ownerId: "owner-1" } },
    });

    await expect(
      refundPayment("pay-1", {
        id: "user-owner-2",
        role: "OWNER",
        ownerProfileId: "owner-2",
      }),
    ).rejects.toBeInstanceOf(AppError);

    expect(mockPrisma.payment.update).not.toHaveBeenCalled();
  });

  it("lets admin refund any payment", async () => {
    mockPrisma.payment.findUnique.mockResolvedValue({
      id: "pay-1",
      bookingId: "booking-1",
      status: "PAID",
      amount: new Decimal(25),
      booking: { clientId: "client-1", salon: { ownerId: "owner-1" } },
    });
    mockPrisma.payment.update.mockResolvedValue({
      id: "pay-1",
      amount: new Decimal(25),
      status: "REFUNDED",
    });

    const refunded = await refundPayment("pay-1", { id: "admin-1", role: "ADMIN" });
    expect(refunded.status).toBe("REFUNDED");
  });
});
