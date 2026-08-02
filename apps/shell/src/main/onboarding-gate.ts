/**
 * Launch-time gate for the first-run onboarding.
 *
 * The onboarding's GenTeam campaign slide points at a credits offer that only
 * goes live at 2026-08-03 19:00 Beijing time (UTC+8). Builds shipped before
 * then must not show the onboarding; once the launch time passes, users who
 * have not seen it yet get it on their next launch (the seen flag is never
 * written while the gate is closed).
 */

/** 2026-08-03 19:00 UTC+8, expressed as a UTC epoch timestamp */
export const ONBOARDING_LAUNCH_TIME_MS = Date.UTC(2026, 7, 3, 11, 0, 0)

export function isOnboardingLive(nowMs: number): boolean {
  return nowMs >= ONBOARDING_LAUNCH_TIME_MS
}
