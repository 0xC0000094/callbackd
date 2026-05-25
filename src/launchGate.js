// Hard-coded launch gate. The app shows a coming-soon splash and the API
// returns 503 until this timestamp passes. Edit one line to ship.
//
// Format: ISO 8601 with explicit offset. 2026-05-24T23:59:00-05:00 is
// 11:59 PM EST (UTC-5) on May 24, 2026.
export const LAUNCH_AT_ISO = "2026-05-24T23:59:00-05:00";
export const LAUNCH_AT_MS = new Date(LAUNCH_AT_ISO).getTime();

export function isLaunched(now = Date.now()) {
  return now >= LAUNCH_AT_MS;
}
