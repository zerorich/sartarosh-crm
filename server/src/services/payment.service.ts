import type { PaymentMethod, PaymentType, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { createPaymentIntent, verifyPaymentSignature } from "../integrations/payment.provider";
import { ERROR_CODES } from "../types";
import { AppError } from "../utils/app-error";
import { roundMoney, toNumber } from "../utils/money";
import { confirmBookingAfterDeposit } from "./booking.service";
import { createNotification } from "./notification.service";
import { writeAudit } from "./audit.service";

export interface CreatePaymentInput {
  bookingId: string;
  method: PaymentMethod;
  type: PaymentType;
  userId: string;
  role: Role;
}

export interface VerifyPaymentInput {
  paymentId: string;
  signature?: string;
  actorId: string;
  role: Role;
}

function expectedAmount(
  type: PaymentType,
  booking: { price: unknown; depositAmount: unknown; remainingAmount: unknown },
): number {
  const price = toNumber(booking.price as never);
  const deposit = toNumber(booking.depositAmount as never);
  const remaining = toNumber(booking.remainingAmount as never);

  switch (type) {
    case "DEPOSIT":
      return deposit;
    case "REMAINING":
      return remaining;
    case "FULL":
      return price;
    default:
      throw AppError.badRequest("Invalid payment type", ERROR_CODES.PAYMENT_INVALID);
  }
}

function assertPaymentAccess(
  booking: { clientId: string; barberId: string; salon: { ownerId: string } },
  userId: string,
  role: Role,
  barberProfileId?: string,
  ownerProfileId?: string,
) {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return;
  if (role === "CLIENT" && booking.clientId === userId) return;
  if (role === "BARBER" && barberProfileId === booking.barberId) return;
  if (role === "OWNER" && ownerProfileId === booking.salon.ownerId) return;
  throw AppError.forbidden("Cannot access this payment");
}

function assertRefundAccess(
  booking: { salon: { ownerId: string } },
  role: Role,
  ownerProfileId?: string,
) {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return;
  if (role === "OWNER" && ownerProfileId === booking.salon.ownerId) return;
  throw AppError.forbidden("Cannot refund this payment");
}

export async function createPayment(input: CreatePaymentInput, barberProfileId?: string, ownerProfileId?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { salon: { select: { ownerId: true } } },
  });
  if (!booking) throw AppError.notFound("Booking not found");

  assertPaymentAccess(booking, input.userId, input.role, barberProfileId, ownerProfileId);

  const amount = expectedAmount(input.type, booking);
  if (amount <= 0) {
    throw AppError.badRequest("Nothing to pay for this type", ERROR_CODES.PAYMENT_INVALID);
  }

  const existingPending = await prisma.payment.findFirst({
    where: {
      bookingId: input.bookingId,
      type: input.type,
      status: "PENDING",
      method: input.method,
    },
  });
  if (existingPending) {
    const intent = input.method === "ONLINE"
      ? createPaymentIntent(existingPending.id, toNumber(existingPending.amount))
      : undefined;
    return {
      payment: serializePayment(existingPending),
      intent,
    };
  }

  const payment = await prisma.payment.create({
    data: {
      bookingId: input.bookingId,
      amount: roundMoney(amount),
      method: input.method,
      type: input.type,
      status: "PENDING",
    },
  });

  const intent =
    input.method === "ONLINE"
      ? createPaymentIntent(payment.id, amount)
      : undefined;

  if (intent) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { signature: intent.signature },
    });
  }

  return { payment: serializePayment(payment), intent };
}

function serializePayment<T extends { amount: unknown }>(payment: T) {
  return { ...payment, amount: toNumber(payment.amount as never) };
}

export async function getPaymentById(
  id: string,
  userId: string,
  role: Role,
  barberProfileId?: string,
  ownerProfileId?: string,
) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      booking: { include: { salon: { select: { ownerId: true } } } },
    },
  });
  if (!payment) throw AppError.notFound("Payment not found");

  assertPaymentAccess(payment.booking, userId, role, barberProfileId, ownerProfileId);
  return serializePayment(payment);
}

export async function verifyPayment(input: VerifyPaymentInput, barberProfileId?: string, ownerProfileId?: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: input.paymentId },
    include: {
      booking: { include: { salon: { select: { ownerId: true } } } },
    },
  });
  if (!payment) throw AppError.notFound("Payment not found");
  if (payment.status !== "PENDING") {
    throw AppError.badRequest("Payment is not pending", ERROR_CODES.PAYMENT_INVALID);
  }

  assertPaymentAccess(payment.booking, input.actorId, input.role, barberProfileId, ownerProfileId);

  if (payment.method === "ONLINE") {
    if (!input.signature) {
      throw AppError.badRequest("Signature required for online payment", ERROR_CODES.PAYMENT_UNVERIFIED);
    }
    const valid = verifyPaymentSignature(
      payment.id,
      toNumber(payment.amount),
      input.signature,
    );
    if (!valid) {
      throw AppError.badRequest("Payment verification failed", ERROR_CODES.PAYMENT_UNVERIFIED);
    }
  } else {
    if (input.role === "CLIENT") {
      throw AppError.forbidden("Clients cannot verify cash/card payments");
    }
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      verifiedAt: new Date(),
      signature: input.signature ?? payment.signature,
    },
  });

  if (payment.type === "DEPOSIT") {
    await confirmBookingAfterDeposit(payment.bookingId);
  }

  await createNotification({
    userId: payment.booking.clientId,
    type: "PAYMENT_SUCCESS",
    title: "Payment successful",
    body: `Your ${payment.type.toLowerCase()} payment was confirmed.`,
    data: { paymentId: payment.id, bookingId: payment.bookingId },
  });

  await writeAudit({
    actorId: input.actorId,
    action: "PAYMENT_VERIFIED",
    entityType: "Payment",
    entityId: payment.id,
    metadata: {
      bookingId: payment.bookingId,
      method: payment.method,
      type: payment.type,
    },
  });

  return serializePayment(updated);
}

export async function refundPayment(
  paymentId: string,
  actor: { id: string; role: Role; ownerProfileId?: string },
  reason?: string,
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: { include: { salon: { select: { ownerId: true } } } } },
  });
  if (!payment) throw AppError.notFound("Payment not found");
  if (payment.status !== "PAID") {
    throw AppError.badRequest("Only paid payments can be refunded", ERROR_CODES.PAYMENT_INVALID);
  }

  assertRefundAccess(payment.booking, actor.role, actor.ownerProfileId);

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "REFUNDED",
      refundedAt: new Date(),
      refundReason: reason,
    },
  });

  await createNotification({
    userId: payment.booking.clientId,
    type: "PAYMENT_SUCCESS",
    title: "Payment refunded",
    body: reason ?? "Your payment has been refunded.",
    data: { paymentId, bookingId: payment.bookingId },
  });

  await writeAudit({
    actorId: actor.id,
    action: "PAYMENT_REFUNDED",
    entityType: "Payment",
    entityId: paymentId,
    metadata: { reason, bookingId: payment.bookingId },
  });

  return serializePayment(updated);
}
