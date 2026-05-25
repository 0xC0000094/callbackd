// Server-authoritative launch status. The splash and the App gate hit this
// to decide whether the analyzer is live, so a visitor who fast-forwards
// their PC clock still sees the countdown until the Vercel function's own
// clock crosses LAUNCH_AT_MS.
import { LAUNCH_AT_ISO, LAUNCH_AT_MS } from "./_lib.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  const nowMs = Date.now();
  res.status(200).json({
    launched: nowMs >= LAUNCH_AT_MS,
    launchAt: LAUNCH_AT_ISO,
    serverNow: new Date(nowMs).toISOString(),
  });
}
