import { describe, it, expect, vi } from 'vitest'

// react-konva's node entry requires the native 'canvas' package; only the pure helper is under test
vi.mock('react-konva', () => {
  const stub = () => null
  return {
    Stage: stub,
    Layer: stub,
    Rect: stub,
    Group: stub,
    Transformer: stub,
    Line: stub,
    Arrow: stub,
    Text: stub,
    Ellipse: stub,
    Image: stub,
    Path: stub,
    Circle: stub,
    Arc: stub,
  }
})

import { canvasPixelRatio } from '../src/renderer/SlideCanvas'

describe('canvasPixelRatio', () => {
  it('follows zoom above 100% so the bitmap matches the displayed resolution (blur)', () => {
    expect(canvasPixelRatio(2, 1.54)).toBeCloseTo(3) // 2*1.54=3.08 → capped
    expect(canvasPixelRatio(1, 1.54)).toBeCloseTo(1.54)
    expect(canvasPixelRatio(1, 2)).toBe(2)
  })

  it('never drops below devicePixelRatio when zoomed out', () => {
    expect(canvasPixelRatio(2, 0.25)).toBe(2)
    expect(canvasPixelRatio(2, 0.7)).toBe(2)
    expect(canvasPixelRatio(1, 0.5)).toBe(1)
  })

  it('caps at 3 to bound canvas memory', () => {
    expect(canvasPixelRatio(2, 3)).toBe(3)
    expect(canvasPixelRatio(3, 2)).toBe(3)
  })

  it('treats a missing/zero devicePixelRatio as 1', () => {
    expect(canvasPixelRatio(0, 1)).toBe(1)
    expect(canvasPixelRatio(0, 2)).toBe(2)
  })
})
