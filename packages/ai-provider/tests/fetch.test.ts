import { afterEach, describe, expect, it, vi } from 'vitest'
import { aiFetch, setRescueFetch } from '../src/fetch'

afterEach(() => {
  vi.unstubAllGlobals()
  setRescueFetch(null)
})

describe('aiFetch', () => {
  it('returns the primary response without touching the rescue path', async () => {
    const ok = new Response('ok')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok))
    const rescue = vi.fn()
    setRescueFetch(rescue)
    expect(await aiFetch('https://x/', {})).toBe(ok)
    expect(rescue).not.toHaveBeenCalled()
  })

  it('retries over the rescue fetch when the primary fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fetch failed')))
    const ok = new Response('rescued')
    const rescue = vi.fn().mockResolvedValue(ok)
    setRescueFetch(rescue)
    expect(await aiFetch('https://x/', {})).toBe(ok)
    expect(rescue).toHaveBeenCalledOnce()
  })

  it('throws the primary error when no rescue fetch is set and max retries exceeded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')))
    await expect(aiFetch('https://x/', {}, { maxRetries: 1, initialDelayMs: 1 })).rejects.toThrow(
      'ECONNRESET',
    )
  })

  it('throws the primary error when the rescue fetch also fails across retries', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('primary down')))
    setRescueFetch(vi.fn().mockRejectedValue(new Error('rescue down')))
    await expect(aiFetch('https://x/', {}, { maxRetries: 1, initialDelayMs: 1 })).rejects.toThrow(
      'primary down',
    )
  })

  it('does not retry an aborted request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('aborted')))
    const rescue = vi.fn()
    setRescueFetch(rescue)
    const controller = new AbortController()
    controller.abort()
    await expect(aiFetch('https://x/', { signal: controller.signal })).rejects.toThrow()
    expect(rescue).not.toHaveBeenCalled()
  })

  it('retries on HTTP 429 and succeeds on subsequent attempt', async () => {
    const rateLimited = new Response('Too Many Requests', { status: 429 })
    const ok = new Response('success', { status: 200 })
    const fetchMock = vi.fn().mockResolvedValueOnce(rateLimited).mockResolvedValueOnce(ok)
    vi.stubGlobal('fetch', fetchMock)

    const response = await aiFetch('https://x/', {}, { maxRetries: 2, initialDelayMs: 10 })
    expect(response.status).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries on HTTP 503 and respects maxRetries ceiling', async () => {
    const serverError = new Response('Service Unavailable', { status: 503 })
    const fetchMock = vi.fn().mockResolvedValue(serverError)
    vi.stubGlobal('fetch', fetchMock)

    const response = await aiFetch('https://x/', {}, { maxRetries: 2, initialDelayMs: 5 })
    expect(response.status).toBe(503)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })
})
