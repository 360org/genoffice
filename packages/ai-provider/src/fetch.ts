/**
 * In Electron main processes AI requests run on Node's fetch (undici), which
 * connects directly instead of going through Chromium's network stack. Under
 * VPN/tun setups those direct connections can get reset (ECONNRESET) while
 * Chromium traffic — login, renderer fetches — works fine. Main processes
 * inject Electron's net.fetch here as a rescue path: when the primary fetch
 * fails at the network layer, the request is retried once over the Chromium
 * stack. Renderers never inject one (their fetch already is Chromium's).
 *
 * aiFetch also implements exponential backoff retry for transient network and
 * server errors (HTTP 429, 502, 503, 504).
 */

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>

let rescueFetch: FetchLike | null = null

export function setRescueFetch(fn: FetchLike | null): void {
  rescueFetch = fn
}

async function singleFetch(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (primaryError) {
    const signal = init.signal as AbortSignal | null | undefined
    if (!rescueFetch || signal?.aborted) throw primaryError
    console.warn('[ai-provider] fetch failed, retrying via rescue fetch:', String(primaryError))
    try {
      return await rescueFetch(url, init)
    } catch {
      throw primaryError
    }
  }
}

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504])

export interface AiFetchOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
}

function parseRetryAfter(response: Response): number | null {
  const header = response.headers.get('retry-after')
  if (!header) return null
  const seconds = Number(header)
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return seconds * 1000
  }
  const date = Date.parse(header)
  if (!Number.isNaN(date)) {
    const diff = date - Date.now()
    return diff > 0 ? diff : 0
  }
  return null
}

function sleep(ms: number, signal?: AbortSignal | null): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new Error('Aborted'))
      return
    }
    const timer = setTimeout(() => {
      if (signal) signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      reject(signal?.reason ?? new Error('Aborted'))
    }
    if (signal) signal.addEventListener('abort', onAbort)
  })
}

export async function aiFetch(
  url: string,
  init: RequestInit,
  options: AiFetchOptions = {},
): Promise<Response> {
  const maxRetries = options.maxRetries ?? 2
  const initialDelay = options.initialDelayMs ?? 100
  const maxDelay = options.maxDelayMs ?? 4000
  const signal = init.signal as AbortSignal | null | undefined

  let attempt = 0
  while (true) {
    if (signal?.aborted) {
      throw signal.reason ?? new Error('Aborted')
    }
    try {
      const response = await singleFetch(url, init)
      if (response.ok || attempt >= maxRetries || !RETRYABLE_STATUS_CODES.has(response.status)) {
        return response
      }
      // Retryable status code (429, 502, 503, 504)
      const retryAfter = parseRetryAfter(response)
      const backoff = Math.min(maxDelay, initialDelay * Math.pow(2, attempt) + Math.random() * 20)
      const delay = retryAfter !== null ? Math.min(maxDelay, retryAfter) : backoff
      attempt++
      await sleep(delay, signal)
    } catch (err) {
      if (signal?.aborted || attempt >= maxRetries) {
        throw err
      }
      const backoff = Math.min(maxDelay, initialDelay * Math.pow(2, attempt) + Math.random() * 20)
      attempt++
      await sleep(backoff, signal)
    }
  }
}
