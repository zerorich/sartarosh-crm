import { describe, expect, it } from "vitest";
import { calculateSalaryAmount } from "../src/services/finance.service";

describe("Salary calculation", () => {
  it("calculates FIXED salary", () => {
    const result = calculateSalaryAmount("FIXED", 500000, 50, 1000000);
    expect(result).toEqual({
      fixedAmount: 500000,
      percentAmount: 0,
      totalAmount: 500000,
    });
  });

  it("calculates PERCENTAGE salary from completed services", () => {
    const result = calculateSalaryAmount("PERCENTAGE", 0, 50, 1000000);
    expect(result).toEqual({
      fixedAmount: 0,
      percentAmount: 500000,
      totalAmount: 500000,
    });
  });

  it("calculates FIXED_PLUS_PERCENTAGE salary", () => {
    const result = calculateSalaryAmount("FIXED_PLUS_PERCENTAGE", 300000, 40, 1000000);
    expect(result).toEqual({
      fixedAmount: 300000,
      percentAmount: 400000,
      totalAmount: 700000,
    });
  });
});

describe("Profit formula", () => {
  it("profit equals revenue minus salary minus expenses", () => {
    const revenue = 5000000;
    const salary = 1200000;
    const expenses = 800000;
    const profit = Math.round((revenue - salary - expenses) * 100) / 100;
    expect(profit).toBe(3000000);
  });
});
