import { describe, expect, it } from "vitest";
import { calculateDeposit, applyCoupon, roundMoney } from "../src/utils/money";

describe("calculateDeposit", () => {
  it("calculates PERCENTAGE deposit", () => {
    const result = calculateDeposit(100, "PERCENTAGE", 25);
    expect(result.depositAmount).toBe(25);
    expect(result.remainingAmount).toBe(75);
  });

  it("calculates FIXED deposit capped at price", () => {
    const result = calculateDeposit(50, "FIXED", 80);
    expect(result.depositAmount).toBe(50);
    expect(result.remainingAmount).toBe(0);
  });

  it("calculates NONE deposit", () => {
    const result = calculateDeposit(120, "NONE", 0);
    expect(result.depositAmount).toBe(0);
    expect(result.remainingAmount).toBe(120);
  });
});

describe("price snapshot", () => {
  it("stores discounted price independent of future service price", () => {
    const servicePrice = 100;
    const discounted = applyCoupon(servicePrice, "PERCENTAGE", 10);
    const { depositAmount, remainingAmount } = calculateDeposit(discounted, "PERCENTAGE", 25);

    expect(discounted).toBe(90);
    expect(depositAmount).toBe(roundMoney(90 * 0.25));
    expect(depositAmount + remainingAmount).toBe(90);

    const futureServicePrice = 150;
    expect(futureServicePrice).not.toBe(discounted);
  });
});
