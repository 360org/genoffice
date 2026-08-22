import type { MailAddress, MailAttachment, ParsedEmail } from '../types'

export function parseAddress(raw: string): MailAddress {
  const trimmed = raw.trim()
  const match = /(.*?)\s*<(.+?)>/.exec(trimmed)
  if (match) {
    const name = match[1].replace(/^["']|["']$/g, '').trim()
    return { name: name || match[2], address: match[2].toLowerCase() }
  }
  return { name: trimmed, address: trimmed.toLowerCase() }
}

export function parseAddressList(raw: string | string[] | undefined): MailAddress[] {
  if (!raw) return []
  const list = Array.isArray(raw) ? raw.join(',') : raw
  return list
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseAddress)
}

export function parseMimeHeaders(headerSection: string): Record<string, string | string[]> {
  const headers: Record<string, string | string[]> = {}
  const unfolded = headerSection.replace(/\r?\n[ \t]+/g, ' ')
  const lines = unfolded.split(/\r?\n/)

  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx <= 0) continue
    const key = line.slice(0, idx).trim().toLowerCase()
    const val = line.slice(idx + 1).trim()
    const existing = headers[key]
    if (existing) {
      if (Array.isArray(existing)) existing.push(val)
      else headers[key] = [existing, val]
    } else {
      headers[key] = val
    }
  }
  return headers
}

export function parseEml(rawEml: string): ParsedEmail {
  const splitIdx = rawEml.search(/\r?\n\r?\n/)
  const headerPart = splitIdx >= 0 ? rawEml.slice(0, splitIdx) : rawEml
  const bodyPart = splitIdx >= 0 ? rawEml.slice(splitIdx).trimStart() : ''

  const headers = parseMimeHeaders(headerPart)

  const subject = String(headers['subject'] || '(No Subject)')
  const from = parseAddress(String(headers['from'] || 'unknown@example.com'))
  const to = parseAddressList(headers['to'])
  const cc = parseAddressList(headers['cc'])
  const bcc = parseAddressList(headers['bcc'])
  const messageId = String(headers['message-id'] || `<msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@genoffice>`)
  const inReplyTo = headers['in-reply-to'] ? String(headers['in-reply-to']) : undefined
  const references = headers['references']
    ? (Array.isArray(headers['references']) ? headers['references'].join(' ') : String(headers['references']))
        .split(/\s+/)
        .filter(Boolean)
    : []

  const dateStr = headers['date'] ? String(headers['date']) : ''
  const parsedDate = dateStr ? new Date(dateStr).getTime() : Date.now()
  const date = Number.isNaN(parsedDate) ? Date.now : parsedDate

  // Clean threading key
  const threadId = inReplyTo || (references.length > 0 ? references[0] : messageId)

  // MIME boundary parsing
  const contentType = String(headers['content-type'] || 'text/plain')
  const boundaryMatch = /boundary=["']?([^"';]+)["']?/i.exec(contentType)

  let bodyText = ''
  let bodyHtml: string | undefined
  const attachments: MailAttachment[] = []

  if (boundaryMatch && boundaryMatch[1]) {
    const boundary = boundaryMatch[1]
    const parts = bodyPart.split(new RegExp(`--${boundary}(?:--)?`))

    for (const part of parts) {
      const p = part.trim()
      if (!p || p === '--') continue
      const pSplit = p.search(/\r?\n\r?\n/)
      const pHeaders = pSplit >= 0 ? parseMimeHeaders(p.slice(0, pSplit)) : {}
      const pBody = pSplit >= 0 ? p.slice(pSplit).trimStart() : p
      const pType = String(pHeaders['content-type'] || 'text/plain').toLowerCase()
      const pDisposition = String(pHeaders['content-disposition'] || '')

      const filenameMatch = /filename=["']?([^"';]+)["']?/i.exec(pDisposition) || /name=["']?([^"';]+)["']?/i.exec(pType)

      if (filenameMatch && filenameMatch[1]) {
        attachments.push({
          id: `att-${Date.now()}-${attachments.length}`,
          filename: filenameMatch[1],
          mimeType: pType.split(';')[0].trim(),
          sizeBytes: pBody.length,
          contentBase64: pHeaders['content-transfer-encoding'] === 'base64' ? pBody.replace(/\s+/g, '') : Buffer.from(pBody).toString('base64'),
        })
      } else if (pType.includes('text/html')) {
        bodyHtml = pBody
      } else if (pType.includes('text/plain')) {
        bodyText = pBody
      }
    }
  } else {
    if (contentType.includes('text/html')) {
      bodyHtml = bodyPart
      bodyText = bodyPart.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    } else {
      bodyText = bodyPart
    }
  }

  const snippet = (bodyText || bodyHtml?.replace(/<[^>]*>/g, ' ') || '')
    .slice(0, 160)
    .replace(/\s+/g, ' ')
    .trim()

  return {
    messageId,
    threadId,
    inReplyTo,
    references,
    subject,
    from,
    to,
    cc,
    bcc,
    date: typeof date === 'function' ? Date.now() : date,
    bodyText,
    bodyHtml,
    snippet,
    attachments,
    headers,
    flags: {
      unread: true,
      starred: false,
      draft: false,
      hasAttachments: attachments.length > 0,
    },
  }
}
