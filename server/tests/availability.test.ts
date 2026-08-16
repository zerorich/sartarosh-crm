import { describe, expect, it } from "vitest";
import { intervalsOverlap, isIntervalWithinHours, minutesBetween } from "../src/utils/time";

describe("intervalsOverlap", () => {
  it("detects overlapping bookings", () => {
    const aStart = new Date("2026-08-16T10:00:00");
    const aEnd = new Date("2026-08-16T11:00:00");
    const bStart = new Date("2026-08-16T10:30:00");
    const bEnd = new Date("2026-08-16T11:30:00");
    expect(intervalsOverlap(aStart, aEnd, bStart, bEnd)).toBe(true);
  });

  it("allows adjacent non-overlapping slots", () => {
    const aStart = new Date("2026-08-16T10:00:00");
    const aEnd = new Date("2026-08-16T11:00:00");
    const bStart = new Date("2026-08-16T11:00:00");
    const bEnd = new Date("2026-08-16T12:00:00");
    expect(intervalsOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);
  });
});

describe("isIntervalWithinHours", () => {
  it("accepts slot within working hours", () => {
    const start = new Date("2026-08-16T10:00:00");
    const end = new Date("2026-08-16T10:45:00");
    expect(isIntervalWithinHours(start, end, "09:00", "18:00")).toBe(true);
  });

  it("rejects slot outside working hours", () => {
    const start = new Date("2026-08-16T07:00:00");
    const end = new Date("2026-08-16T07:30:00");
    expect(isIntervalWithinHours(start, end, "09:00", "18:00")).toBe(false);
  });
});

describe("minutesBetween", () => {
  it("calculates barber delay minutes", () => {
    const scheduled = new Date("2026-08-16T10:00:00");
    const actual = new Date("2026-08-16T10:12:00");
    expect(minutesBetween(actual, scheduled)).toBe(12);
  });
});
