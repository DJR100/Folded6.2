/**
 * Utility helpers for the “Money Saved Since Quitting” live counter.
 *
 * All maths is deterministic, pure, and dependency‑free so it can run
 * on the client, in Cloud Functions, or in Jest without mocking dates.
 * Everything is exported so you can unit‑test each piece individually.
 */

/** Calendar‑average number of days in a month. */
export const DAYS_PER_MONTH = 30.44;

/** Milliseconds in a day (24 × 60 × 60 × 1 000). */
export const MS_PER_DAY = 86_400_000;

/**
 * Convert the user’s maximum monthly‑spend bracket value
 * (stored as `monthlySpend.max` in Firestore) into the assumed
 * monthly spend (USD).
 *
 * Upper‑bound rule: we attribute the top of the bracket, and for the
 * open‑ended band (> 2 000) we assume 4 000 USD.
 *
 * @param max – The `monthlySpend.max` number captured at onboarding.
 * @returns The assumed monthly spend in USD.
 */
export function lookupMonthlySpend(max: number): number {
  if (max <= 150) return 150;
  if (max <= 100) return 100; // unreachable (100 < 150) but explicit
  if (max <= 250) return 250;
  if (max <= 500) return 500;
  if (max <= 1_000) return 1_000;
  if (max <= 2_000) return 2_000;
  return 4_000; // “> 2 000” bucket
}

/** Object persisted to Firestore under `spendMeta`. */
export interface SpendMeta {
  /** The bracket‑derived monthly spend assumption in USD. */
  monthlySpendAssumptionUSD: number;
  /** Fixed per‑millisecond save rate (USD / ms). */
  usdPerMs: number;
}

/**
 * Derive the two numbers we store in `spendMeta`.
 * Call this exactly once after onboarding (or whenever the user
 * changes their monthly‑spend bracket).
 *
 * @param monthlyMax – The `monthlySpend.max` value chosen by the user.
 */
export function deriveSpendMeta(monthlyMax: number): SpendMeta {
  const monthlySpendAssumptionUSD = lookupMonthlySpend(monthlyMax);
  const usdPerMs = monthlySpendAssumptionUSD / (DAYS_PER_MONTH * MS_PER_DAY);
  return { monthlySpendAssumptionUSD, usdPerMs };
}

/**
 * Compute how much money the user has saved so far.
 * This is the function your live ticker calls every repaint tick.
 *
 * @param usdPerMs – The cached rate stored in `spendMeta`.
 * @param quitTimestampMs – `streak.start` (Unix milliseconds).
 * @returns The total dollars saved since `quitTimestampMs`.
 */
export function computeSaved(
  usdPerMs: number,
  quitTimestampMs: number,
): number {
  const elapsedMs = Date.now() - quitTimestampMs;
  return elapsedMs * usdPerMs;
}
