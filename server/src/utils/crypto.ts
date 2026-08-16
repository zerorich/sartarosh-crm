import { createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashValue(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function randomToken(bytes = 48): string {
  return randomBytes(bytes).toString("hex");
}

export function signPayment(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}
