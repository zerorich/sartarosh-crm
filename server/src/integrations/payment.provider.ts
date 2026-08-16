import { env } from "../config/env";
import { signPayment, safeEqual } from "../utils/crypto";

export function createPaymentIntent(paymentId: string, amount: number) {
  const payload = `${paymentId}:${amount}`;
  return {
    paymentId,
    amount,
    signature: signPayment(payload, env.PAYMENT_SECRET),
  };
}

export function verifyPaymentSignature(paymentId: string, amount: number, signature: string) {
  const expected = signPayment(`${paymentId}:${amount}`, env.PAYMENT_SECRET);
  return safeEqual(expected, signature);
}
