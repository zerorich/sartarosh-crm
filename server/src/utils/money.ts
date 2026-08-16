import { Decimal } from "@prisma/client/runtime/library";

export function toNumber(value: Decimal | number | string): number {
  return typeof value === "number" ? value : Number(value);
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateDeposit(
  price: number,
  depositType: "PERCENTAGE" | "FIXED" | "NONE",
  depositValue: number,
): { depositAmount: number; remainingAmount: number } {
  let depositAmount = 0;
  if (depositType === "PERCENTAGE") {
    depositAmount = roundMoney((price * depositValue) / 100);
  } else if (depositType === "FIXED") {
    depositAmount = roundMoney(Math.min(depositValue, price));
  }
  return {
    depositAmount,
    remainingAmount: roundMoney(price - depositAmount),
  };
}

export function applyCoupon(
  price: number,
  type: "PERCENTAGE" | "FIXED",
  value: number,
): number {
  if (type === "PERCENTAGE") {
    return roundMoney(Math.max(0, price - (price * value) / 100));
  }
  return roundMoney(Math.max(0, price - value));
}
