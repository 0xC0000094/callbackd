// Hard-coded launch gate. The app shows a coming-soon splash and the API
// returns 503 until this timestamp passes. Edit one line to ship.
//
// Anchored to Edmonton local time to avoid double conversion:
// 2026-05-24T22:00:00-06:00 = 10:00 PM MDT on May 24, 2026.
export const LAUNCH_AT_ISO = "2026-05-24T22:00:00-06:00";
export const LAUNCH_AT_MS = new Date(LAUNCH_AT_ISO).getTime();

export function isLaunched(now = Date.now()) {
  return now >= LAUNCH_AT_MS;
}
