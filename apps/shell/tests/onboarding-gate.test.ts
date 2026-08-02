import { describe, expect, it } from 'vitest'
import { isOnboardingLive, ONBOARDING_LAUNCH_TIME_MS } from '../src/main/onboarding-gate'

/**
 * Launch-time gate for the first-run onboarding (src/main/onboarding-gate.ts):
 * the onboarding (and its GenTeam campaign slide) must not show before the
 * campaign goes live at 2026-08-03 19:00 Beijing time (UTC+8).
 */

describe('ONBOARDING_LAUNCH_TIME_MS', () => {
  it('is 2026-08-03 19:00 Beijing time expressed in UTC', () => {
    expect(new Date(ONBOARDING_LAUNCH_TIME_MS).toISOString()).toBe('2026-08-03T11:00:00.000Z')
  })
})

describe('isOnboardingLive', () => {
  it('is false before the launch time', () => {
    expect(isOnboardingLive(ONBOARDING_LAUNCH_TIME_MS - 1)).toBe(false)
  })

  it('is true exactly at the launch time', () => {
    expect(isOnboardingLive(ONBOARDING_LAUNCH_TIME_MS)).toBe(true)
  })

  it('is true after the launch time', () => {
    expect(isOnboardingLive(ONBOARDING_LAUNCH_TIME_MS + 60_000)).toBe(true)
  })
})
