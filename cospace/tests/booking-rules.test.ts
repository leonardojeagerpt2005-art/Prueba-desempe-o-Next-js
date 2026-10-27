import { describe, it, expect, vi } from "vitest";
import {
  getDurationHours,
  validateDuration,
  validateWholeHours,
  validateOperatingHours,
  validateNotInPast,
  validateAdvanceLimit,
  hasOverlap,
  findOverlap,
  validateActiveBookingsLimit,
  calculateTotalPrice,
  canCancelBooking,
  validateBookingTimes,
  MIN_DURATION_HOURS,
  MAX_DURATION_HOURS,
  OPERATING_START_HOUR,
  OPERATING_END_HOUR,
  MAX_ADVANCE_DAYS,
  MAX_ACTIVE_BOOKINGS,
  MIN_CANCEL_HOURS,
  type BookingInterval,
} from "../src/lib/booking-rules";

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Creates a Date in UTC for predictable testing. */
function utcDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
  second = 0,
  ms = 0
): Date {
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms));
}

// ─── getDurationHours ────────────────────────────────────────────────────────

describe("getDurationHours", () => {
  it("returns 1 for a 1-hour slot", () => {
    const start = utcDate(2026, 12, 1, 10);
    const end = utcDate(2026, 12, 1, 11);
    expect(getDurationHours(start, end)).toBe(1);
  });

  it("returns 4 for a 4-hour slot", () => {
    const start = utcDate(2026, 12, 1, 8);
    const end = utcDate(2026, 12, 1, 12);
    expect(getDurationHours(start, end)).toBe(4);
  });

  it("returns 0.5 for a 30-minute slot", () => {
    const start = utcDate(2026, 12, 1, 10, 0);
    const end = utcDate(2026, 12, 1, 10, 30);
    expect(getDurationHours(start, end)).toBe(0.5);
  });

  it("returns negative for reversed times", () => {
    const start = utcDate(2026, 12, 1, 12);
    const end = utcDate(2026, 12, 1, 10);
    expect(getDurationHours(start, end)).toBe(-2);
  });
});

// ─── validateDuration ────────────────────────────────────────────────────────

describe("validateDuration", () => {
  it("accepts 1-hour booking", () => {
    const result = validateDuration(utcDate(2026, 12, 1, 10), utcDate(2026, 12, 1, 11));
    expect(result.valid).toBe(true);
  });

  it("accepts 2-hour booking", () => {
    const result = validateDuration(utcDate(2026, 12, 1, 10), utcDate(2026, 12, 1, 12));
    expect(result.valid).toBe(true);
  });

  it("accepts 3-hour booking", () => {
    const result = validateDuration(utcDate(2026, 12, 1, 10), utcDate(2026, 12, 1, 13));
    expect(result.valid).toBe(true);
  });

  it("accepts 4-hour booking (maximum)", () => {
    const result = validateDuration(utcDate(2026, 12, 1, 10), utcDate(2026, 12, 1, 14));
    expect(result.valid).toBe(true);
  });

  it("rejects 0-hour booking", () => {
    const result = validateDuration(utcDate(2026, 12, 1, 10), utcDate(2026, 12, 1, 10));
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects 5-hour booking (exceeds max)", () => {
    const result = validateDuration(utcDate(2026, 12, 1, 10), utcDate(2026, 12, 1, 15));
    expect(result.valid).toBe(false);
  });

  it("rejects fractional hours (1.5h)", () => {
    const result = validateDuration(utcDate(2026, 12, 1, 10, 0), utcDate(2026, 12, 1, 11, 30));
    expect(result.valid).toBe(false);
  });

  it("rejects negative duration", () => {
    const result = validateDuration(utcDate(2026, 12, 1, 12), utcDate(2026, 12, 1, 10));
    expect(result.valid).toBe(false);
  });

  it("constants match expected min/max", () => {
    expect(MIN_DURATION_HOURS).toBe(1);
    expect(MAX_DURATION_HOURS).toBe(4);
  });
});

// ─── validateWholeHours ──────────────────────────────────────────────────────

describe("validateWholeHours", () => {
  it("accepts clean whole hours", () => {
    const result = validateWholeHours(utcDate(2026, 12, 1, 10), utcDate(2026, 12, 1, 12));
    expect(result.valid).toBe(true);
  });

  it("rejects start with minutes", () => {
    const result = validateWholeHours(utcDate(2026, 12, 1, 10, 15), utcDate(2026, 12, 1, 12));
    expect(result.valid).toBe(false);
  });

  it("rejects end with minutes", () => {
    const result = validateWholeHours(utcDate(2026, 12, 1, 10), utcDate(2026, 12, 1, 12, 30));
    expect(result.valid).toBe(false);
  });

  it("rejects start with seconds", () => {
    const result = validateWholeHours(utcDate(2026, 12, 1, 10, 0, 1), utcDate(2026, 12, 1, 12));
    expect(result.valid).toBe(false);
  });

  it("rejects end with milliseconds", () => {
    const result = validateWholeHours(utcDate(2026, 12, 1, 10), utcDate(2026, 12, 1, 12, 0, 0, 500));
    expect(result.valid).toBe(false);
  });
});

// ─── validateOperatingHours ──────────────────────────────────────────────────

describe("validateOperatingHours", () => {
  it("accepts booking 07:00 - 08:00 (earliest valid)", () => {
    const result = validateOperatingHours(utcDate(2026, 12, 1, 7), utcDate(2026, 12, 1, 8));
    expect(result.valid).toBe(true);
  });

  it("accepts booking 20:00 - 21:00 (latest valid)", () => {
    const result = validateOperatingHours(utcDate(2026, 12, 1, 20), utcDate(2026, 12, 1, 21));
    expect(result.valid).toBe(true);
  });

  it("accepts 10:00 - 14:00 (mid-day 4h)", () => {
    const result = validateOperatingHours(utcDate(2026, 12, 1, 10), utcDate(2026, 12, 1, 14));
    expect(result.valid).toBe(true);
  });

  it("rejects start before 07:00", () => {
    const result = validateOperatingHours(utcDate(2026, 12, 1, 6), utcDate(2026, 12, 1, 8));
    expect(result.valid).toBe(false);
  });

  it("rejects end after 21:00", () => {
    const result = validateOperatingHours(utcDate(2026, 12, 1, 20), utcDate(2026, 12, 1, 22));
    expect(result.valid).toBe(false);
  });

  it("rejects entirely outside hours (03:00 - 05:00)", () => {
    const result = validateOperatingHours(utcDate(2026, 12, 1, 3), utcDate(2026, 12, 1, 5));
    expect(result.valid).toBe(false);
  });

  it("constants match expected values", () => {
    expect(OPERATING_START_HOUR).toBe(7);
    expect(OPERATING_END_HOUR).toBe(21);
  });
});

// ─── validateNotInPast ───────────────────────────────────────────────────────

describe("validateNotInPast", () => {
  it("accepts a future booking", () => {
    const now = utcDate(2026, 12, 1, 10);
    const start = utcDate(2026, 12, 1, 14);
    expect(validateNotInPast(start, now).valid).toBe(true);
  });

  it("rejects a booking in the past", () => {
    const now = utcDate(2026, 12, 1, 10);
    const start = utcDate(2026, 12, 1, 8);
    expect(validateNotInPast(start, now).valid).toBe(false);
  });

  it("rejects a booking starting exactly now", () => {
    const now = utcDate(2026, 12, 1, 10);
    const start = utcDate(2026, 12, 1, 10);
    expect(validateNotInPast(start, now).valid).toBe(false);
  });

  it("accepts a booking 1 minute in the future", () => {
    const now = utcDate(2026, 12, 1, 10, 0);
    const start = utcDate(2026, 12, 1, 10, 1);
    expect(validateNotInPast(start, now).valid).toBe(true);
  });
});

// ─── validateAdvanceLimit ────────────────────────────────────────────────────

describe("validateAdvanceLimit", () => {
  it("accepts booking 1 day in the future", () => {
    const now = utcDate(2026, 12, 1, 10);
    const start = utcDate(2026, 12, 2, 10);
    expect(validateAdvanceLimit(start, now).valid).toBe(true);
  });

  it("accepts booking exactly 30 days in the future", () => {
    const now = utcDate(2026, 12, 1, 10);
    const start = utcDate(2026, 12, 31, 10);
    expect(validateAdvanceLimit(start, now).valid).toBe(true);
  });

  it("rejects booking 31 days in the future", () => {
    const now = utcDate(2026, 12, 1, 10);
    const start = utcDate(2027, 1, 1, 11); // 31 days + 1 hour
    expect(validateAdvanceLimit(start, now).valid).toBe(false);
  });

  it("constant matches expected value", () => {
    expect(MAX_ADVANCE_DAYS).toBe(30);
  });
});

// ─── hasOverlap ──────────────────────────────────────────────────────────────

describe("hasOverlap", () => {
  it("detects full overlap", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 12),
    };
    const existing: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 12),
    };
    expect(hasOverlap(newBooking, existing)).toBe(true);
  });

  it("detects partial overlap (new starts during existing)", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 11),
      end: utcDate(2026, 12, 1, 13),
    };
    const existing: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 12),
    };
    expect(hasOverlap(newBooking, existing)).toBe(true);
  });

  it("detects partial overlap (new ends during existing)", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 9),
      end: utcDate(2026, 12, 1, 11),
    };
    const existing: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 12),
    };
    expect(hasOverlap(newBooking, existing)).toBe(true);
  });

  it("detects containment (new contains existing)", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 9),
      end: utcDate(2026, 12, 1, 14),
    };
    const existing: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 12),
    };
    expect(hasOverlap(newBooking, existing)).toBe(true);
  });

  it("ALLOWS contiguous bookings (10-11 then 11-12)", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 11),
      end: utcDate(2026, 12, 1, 12),
    };
    const existing: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 11),
    };
    expect(hasOverlap(newBooking, existing)).toBe(false);
  });

  it("ALLOWS contiguous bookings (reverse: 11-12 then 10-11)", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 11),
    };
    const existing: BookingInterval = {
      start: utcDate(2026, 12, 1, 11),
      end: utcDate(2026, 12, 1, 12),
    };
    expect(hasOverlap(newBooking, existing)).toBe(false);
  });

  it("no overlap for completely separate intervals", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 14),
      end: utcDate(2026, 12, 1, 16),
    };
    const existing: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 12),
    };
    expect(hasOverlap(newBooking, existing)).toBe(false);
  });

  it("no overlap for bookings on different days", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 2, 10),
      end: utcDate(2026, 12, 2, 12),
    };
    const existing: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 12),
    };
    expect(hasOverlap(newBooking, existing)).toBe(false);
  });
});

// ─── findOverlap ─────────────────────────────────────────────────────────────

describe("findOverlap", () => {
  it("returns null when no existing bookings", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 12),
    };
    expect(findOverlap(newBooking, [])).toBeNull();
  });

  it("returns null when no overlap exists", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 14),
      end: utcDate(2026, 12, 1, 16),
    };
    const existing: BookingInterval[] = [
      { start: utcDate(2026, 12, 1, 10), end: utcDate(2026, 12, 1, 12) },
    ];
    expect(findOverlap(newBooking, existing)).toBeNull();
  });

  it("returns the overlapping booking", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 11),
      end: utcDate(2026, 12, 1, 13),
    };
    const overlap: BookingInterval = {
      start: utcDate(2026, 12, 1, 10),
      end: utcDate(2026, 12, 1, 12),
    };
    const existing: BookingInterval[] = [overlap];
    expect(findOverlap(newBooking, existing)).toBe(overlap);
  });

  it("returns null for contiguous bookings in a list", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 12),
      end: utcDate(2026, 12, 1, 14),
    };
    const existing: BookingInterval[] = [
      { start: utcDate(2026, 12, 1, 10), end: utcDate(2026, 12, 1, 12) },
      { start: utcDate(2026, 12, 1, 14), end: utcDate(2026, 12, 1, 16) },
    ];
    expect(findOverlap(newBooking, existing)).toBeNull();
  });

  it("detects overlap among multiple bookings", () => {
    const newBooking: BookingInterval = {
      start: utcDate(2026, 12, 1, 15),
      end: utcDate(2026, 12, 1, 17),
    };
    const overlap: BookingInterval = {
      start: utcDate(2026, 12, 1, 14),
      end: utcDate(2026, 12, 1, 16),
    };
    const existing: BookingInterval[] = [
      { start: utcDate(2026, 12, 1, 10), end: utcDate(2026, 12, 1, 12) },
      overlap,
    ];
    expect(findOverlap(newBooking, existing)).toBe(overlap);
  });
});

// ─── validateActiveBookingsLimit ─────────────────────────────────────────────

describe("validateActiveBookingsLimit", () => {
  it("accepts when user has 0 active bookings", () => {
    expect(validateActiveBookingsLimit(0).valid).toBe(true);
  });

  it("accepts when user has 1 active booking", () => {
    expect(validateActiveBookingsLimit(1).valid).toBe(true);
  });

  it("accepts when user has 2 active bookings", () => {
    expect(validateActiveBookingsLimit(2).valid).toBe(true);
  });

  it("rejects when user has 3 active bookings (at limit)", () => {
    expect(validateActiveBookingsLimit(3).valid).toBe(false);
  });

  it("rejects when user has 4+ active bookings", () => {
    expect(validateActiveBookingsLimit(4).valid).toBe(false);
  });

  it("constant matches expected value", () => {
    expect(MAX_ACTIVE_BOOKINGS).toBe(3);
  });
});

// ─── calculateTotalPrice ─────────────────────────────────────────────────────

describe("calculateTotalPrice", () => {
  it("calculates 1h × $15 = $15", () => {
    expect(calculateTotalPrice(1, 15)).toBe(15);
  });

  it("calculates 2h × $22.50 = $45", () => {
    expect(calculateTotalPrice(2, 22.5)).toBe(45);
  });

  it("calculates 3h × $60 = $180", () => {
    expect(calculateTotalPrice(3, 60)).toBe(180);
  });

  it("calculates 4h × $10 = $40", () => {
    expect(calculateTotalPrice(4, 10)).toBe(40);
  });

  it("rounds to 2 decimal places", () => {
    // 3 × 19.99 = 59.97
    expect(calculateTotalPrice(3, 19.99)).toBe(59.97);
  });

  it("handles floating-point precision (1h × $0.1 + $0.2 scenario)", () => {
    const result = calculateTotalPrice(1, 0.3);
    expect(result).toBe(0.3);
  });

  it("returns 0 for 0 hours", () => {
    expect(calculateTotalPrice(0, 50)).toBe(0);
  });
});

// ─── canCancelBooking ────────────────────────────────────────────────────────

describe("canCancelBooking", () => {
  it("admin can cancel any booking regardless of time", () => {
    const now = utcDate(2026, 12, 1, 10);
    const bookingStart = utcDate(2026, 12, 1, 10, 30); // only 30 min away
    expect(canCancelBooking(bookingStart, now, true).valid).toBe(true);
  });

  it("admin can cancel booking starting in 1 minute", () => {
    const now = utcDate(2026, 12, 1, 10, 0);
    const bookingStart = utcDate(2026, 12, 1, 10, 1);
    expect(canCancelBooking(bookingStart, now, true).valid).toBe(true);
  });

  it("regular user CAN cancel with exactly 2 hours remaining", () => {
    const now = utcDate(2026, 12, 1, 10);
    const bookingStart = utcDate(2026, 12, 1, 12);
    expect(canCancelBooking(bookingStart, now, false).valid).toBe(true);
  });

  it("regular user CAN cancel with 3 hours remaining", () => {
    const now = utcDate(2026, 12, 1, 10);
    const bookingStart = utcDate(2026, 12, 1, 13);
    expect(canCancelBooking(bookingStart, now, false).valid).toBe(true);
  });

  it("regular user CANNOT cancel with 1h59m remaining", () => {
    const now = utcDate(2026, 12, 1, 10, 1);
    const bookingStart = utcDate(2026, 12, 1, 12);
    expect(canCancelBooking(bookingStart, now, false).valid).toBe(false);
  });

  it("regular user CANNOT cancel with 30 minutes remaining", () => {
    const now = utcDate(2026, 12, 1, 11, 30);
    const bookingStart = utcDate(2026, 12, 1, 12);
    expect(canCancelBooking(bookingStart, now, false).valid).toBe(false);
  });

  it("regular user CANNOT cancel a past booking", () => {
    const now = utcDate(2026, 12, 1, 14);
    const bookingStart = utcDate(2026, 12, 1, 10);
    expect(canCancelBooking(bookingStart, now, false).valid).toBe(false);
  });

  it("constant matches expected value", () => {
    expect(MIN_CANCEL_HOURS).toBe(2);
  });
});

// ─── validateBookingTimes (Integration Pipeline) ─────────────────────────────

describe("validateBookingTimes (full pipeline)", () => {
  it("accepts a valid booking within all constraints", () => {
    const now = utcDate(2026, 12, 1, 8);
    const start = utcDate(2026, 12, 1, 10);
    const end = utcDate(2026, 12, 1, 12);
    const result = validateBookingTimes(start, end, now);
    expect(result.valid).toBe(true);
  });

  it("accepts a 1-hour booking at operating boundaries (07:00-08:00)", () => {
    const now = utcDate(2026, 12, 1, 6);
    const start = utcDate(2026, 12, 1, 7);
    const end = utcDate(2026, 12, 1, 8);
    expect(validateBookingTimes(start, end, now).valid).toBe(true);
  });

  it("accepts a 4-hour booking ending at 21:00", () => {
    const now = utcDate(2026, 12, 1, 8);
    const start = utcDate(2026, 12, 1, 17);
    const end = utcDate(2026, 12, 1, 21);
    expect(validateBookingTimes(start, end, now).valid).toBe(true);
  });

  it("rejects booking in the past (first check)", () => {
    const now = utcDate(2026, 12, 1, 15);
    const start = utcDate(2026, 12, 1, 10);
    const end = utcDate(2026, 12, 1, 12);
    const result = validateBookingTimes(start, end, now);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("pasada");
  });

  it("rejects booking beyond 30 days", () => {
    const now = utcDate(2026, 12, 1, 10);
    const start = utcDate(2027, 2, 1, 10);
    const end = utcDate(2027, 2, 1, 12);
    const result = validateBookingTimes(start, end, now);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("30 días");
  });

  it("rejects booking with non-whole-hours", () => {
    const now = utcDate(2026, 12, 1, 8);
    const start = utcDate(2026, 12, 1, 10, 15);
    const end = utcDate(2026, 12, 1, 12, 15);
    const result = validateBookingTimes(start, end, now);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("horas completas");
  });

  it("rejects 5-hour booking", () => {
    const now = utcDate(2026, 12, 1, 8);
    const start = utcDate(2026, 12, 1, 10);
    const end = utcDate(2026, 12, 1, 15);
    const result = validateBookingTimes(start, end, now);
    expect(result.valid).toBe(false);
  });

  it("rejects booking outside operating hours (06:00)", () => {
    const now = utcDate(2026, 12, 1, 5);
    const start = utcDate(2026, 12, 1, 6);
    const end = utcDate(2026, 12, 1, 8);
    const result = validateBookingTimes(start, end, now);
    expect(result.valid).toBe(false);
  });
});
