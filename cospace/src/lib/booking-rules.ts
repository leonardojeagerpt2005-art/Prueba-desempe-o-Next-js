/**
 * Pure business-logic functions for booking validation.
 * These are decoupled from Prisma/Next.js so they can be unit-tested with Vitest.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

export const MIN_DURATION_HOURS = 1;
export const MAX_DURATION_HOURS = 4;
export const OPERATING_START_HOUR = 7;
export const OPERATING_END_HOUR = 21;
export const MAX_ADVANCE_DAYS = 30;
export const MAX_ACTIVE_BOOKINGS = 3;
export const MIN_CANCEL_HOURS = 2;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BookingInterval {
  start: Date;
  end: Date;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// ─── Duration Validation ─────────────────────────────────────────────────────

/** Returns duration in hours between two dates. */
export function getDurationHours(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

/** Checks that duration is an integer between 1 and 4 hours. */
export function validateDuration(start: Date, end: Date): ValidationResult {
  const hours = getDurationHours(start, end);
  if (!Number.isInteger(hours) || hours < MIN_DURATION_HOURS || hours > MAX_DURATION_HOURS) {
    return {
      valid: false,
      error: `La reserva debe durar entre ${MIN_DURATION_HOURS} y ${MAX_DURATION_HOURS} horas completas`,
    };
  }
  return { valid: true };
}

// ─── Whole-Hour Validation ───────────────────────────────────────────────────

/** Checks that both start and end are exact whole hours (no minutes/seconds/ms). */
export function validateWholeHours(start: Date, end: Date): ValidationResult {
  const isStartWhole =
    start.getMinutes() === 0 &&
    start.getSeconds() === 0 &&
    start.getMilliseconds() === 0;
  const isEndWhole =
    end.getMinutes() === 0 &&
    end.getSeconds() === 0 &&
    end.getMilliseconds() === 0;

  if (!isStartWhole || !isEndWhole) {
    return {
      valid: false,
      error: "Las reservas deben ser en horas completas (ejemplo: 10:00 a 12:00)",
    };
  }
  return { valid: true };
}

// ─── Operating Hours Validation ──────────────────────────────────────────────

/**
 * Checks that start >= 07:00 and end <= 21:00 using UTC hours.
 * The API stores/receives dates in UTC, so we check against UTC hours.
 */
export function validateOperatingHours(start: Date, end: Date): ValidationResult {
  const startHour = start.getUTCHours();
  const endHour = end.getUTCHours();

  if (startHour < OPERATING_START_HOUR) {
    return {
      valid: false,
      error: `El horario de reserva comienza a las ${OPERATING_START_HOUR}:00`,
    };
  }

  if (endHour > OPERATING_END_HOUR || (endHour === OPERATING_END_HOUR && end.getUTCMinutes() > 0)) {
    return {
      valid: false,
      error: `El horario de reserva termina a las ${OPERATING_END_HOUR}:00`,
    };
  }

  return { valid: true };
}

// ─── Past Date Validation ────────────────────────────────────────────────────

/** Checks that the start time is in the future. */
export function validateNotInPast(start: Date, now: Date): ValidationResult {
  if (start <= now) {
    return {
      valid: false,
      error: "No se puede reservar en una fecha u hora pasada",
    };
  }
  return { valid: true };
}

// ─── Advance Limit Validation ────────────────────────────────────────────────

/** Checks that the booking is not more than 30 days in the future. */
export function validateAdvanceLimit(start: Date, now: Date): ValidationResult {
  const maxDate = new Date(now.getTime() + MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);
  if (start > maxDate) {
    return {
      valid: false,
      error: `No se pueden realizar reservas con más de ${MAX_ADVANCE_DAYS} días de anticipación`,
    };
  }
  return { valid: true };
}

// ─── Overlap Detection ───────────────────────────────────────────────────────

/**
 * Determines if two time intervals overlap using strict inequality.
 * Contiguous bookings (e.g. 10:00-11:00 and 11:00-12:00) are ALLOWED.
 * True overlap: start < existingEnd AND end > existingStart
 */
export function hasOverlap(
  newBooking: BookingInterval,
  existingBooking: BookingInterval
): boolean {
  return (
    newBooking.start.getTime() < existingBooking.end.getTime() &&
    newBooking.end.getTime() > existingBooking.start.getTime()
  );
}

/**
 * Checks if a new booking overlaps with any existing booking in the list.
 * Returns the first overlapping booking, or null if no overlap.
 */
export function findOverlap(
  newBooking: BookingInterval,
  existingBookings: BookingInterval[]
): BookingInterval | null {
  for (const existing of existingBookings) {
    if (hasOverlap(newBooking, existing)) {
      return existing;
    }
  }
  return null;
}

// ─── Active Bookings Limit ───────────────────────────────────────────────────

/** Checks that the user has fewer than MAX_ACTIVE_BOOKINGS active bookings. */
export function validateActiveBookingsLimit(currentActiveCount: number): ValidationResult {
  if (currentActiveCount >= MAX_ACTIVE_BOOKINGS) {
    return {
      valid: false,
      error: `Has alcanzado el límite de ${MAX_ACTIVE_BOOKINGS} reservas futuras activas permitidas`,
    };
  }
  return { valid: true };
}

// ─── Price Calculation ───────────────────────────────────────────────────────

/** Calculates the total price, always on the server side. */
export function calculateTotalPrice(durationHours: number, pricePerHour: number): number {
  return Number((durationHours * pricePerHour).toFixed(2));
}

// ─── Cancellation Rules ──────────────────────────────────────────────────────

/**
 * Determines if a booking can be cancelled.
 * - Admin can always cancel.
 * - Regular user can only cancel if the booking starts at least MIN_CANCEL_HOURS hours from now.
 */
export function canCancelBooking(
  bookingStart: Date,
  now: Date,
  isAdmin: boolean
): ValidationResult {
  if (isAdmin) {
    return { valid: true };
  }

  const hoursUntilStart = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilStart < MIN_CANCEL_HOURS) {
    return {
      valid: false,
      error: `Solo se puede cancelar con al menos ${MIN_CANCEL_HOURS} horas de anticipación`,
    };
  }
  return { valid: true };
}

// ─── Full Validation Pipeline ────────────────────────────────────────────────

/**
 * Runs all time-based validations for a new booking.
 * Does NOT check overlaps or active count (those require DB queries).
 */
export function validateBookingTimes(
  start: Date,
  end: Date,
  now: Date
): ValidationResult {
  const checks: ValidationResult[] = [
    validateNotInPast(start, now),
    validateAdvanceLimit(start, now),
    validateWholeHours(start, end),
    validateDuration(start, end),
    validateOperatingHours(start, end),
  ];

  for (const check of checks) {
    if (!check.valid) {
      return check;
    }
  }

  return { valid: true };
}
