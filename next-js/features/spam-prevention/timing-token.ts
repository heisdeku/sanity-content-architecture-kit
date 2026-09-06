import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/env";

/** Reject submissions faster than this (bots) or older than this (replays). */
export const MIN_ELAPSED_MS = 3_000;
export const MAX_ELAPSED_MS = 24 * 60 * 60 * 1000;

function sign(timestamp: string) {
  return createHmac("sha256", env.FORM_SECRET).update(timestamp).digest("hex");
}

/** `${renderedAt}.${hmac}`; rendered into the form at request time. */
export function createTimingToken(now = Date.now()): string {
  const timestamp = String(now);
  return `${timestamp}.${sign(timestamp)}`;
}

export type TimingTokenResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "too-fast" | "expired" };

export function verifyTimingToken(
  token: string | undefined,
  now = Date.now(),
): TimingTokenResult {
  if (!token) return { ok: false, reason: "invalid" };
  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature || !/^\d+$/.test(timestamp))
    return { ok: false, reason: "invalid" };

  const expected = Buffer.from(sign(timestamp));
  const received = Buffer.from(signature);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return { ok: false, reason: "invalid" };
  }

  const elapsed = now - Number(timestamp);
  if (elapsed < MIN_ELAPSED_MS) return { ok: false, reason: "too-fast" };
  if (elapsed > MAX_ELAPSED_MS) return { ok: false, reason: "expired" };
  return { ok: true };
}
