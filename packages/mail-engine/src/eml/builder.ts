import type { MailAddress, MailAttachment } from '../types'

export interface ComposeOptions {
  from: MailAddress
  to: MailAddress[]
  cc?: MailAddress[]
  bcc?: MailAddress[]
  subject: string
  bodyText: string
  bodyHtml?: string
  inReplyTo?: string
  references?: string[]
  attachments?: MailAttachment[]
}

function formatAddress(addr: MailAddress): string {
  return addr.name ? `"${addr.name.replace(/"/g, '\\"')}" <${addr.address}>` : addr.address
}

export function buildEml(opts: ComposeOptions): string {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  const lines: string[] = []

  lines.push(`From: ${formatAddress(opts.from)}`)
  lines.push(`To: ${opts.to.map(formatAddress).join(', ')}`)
  if (opts.cc && opts.cc.length > 0) lines.push(`Cc: ${opts.cc.map(formatAddress).join(', ')}`)
  if (opts.bcc && opts.bcc.length > 0) lines.push(`Bcc: ${opts.bcc.map(formatAddress).join(', ')}`)
  lines.push(`Subject: ${opts.subject}`)
  lines.push(`Date: ${new Date().toUTCString()}`)
  lines.push(`Message-ID: <msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@genoffice>`)

  if (opts.inReplyTo) lines.push(`In-Reply-To: ${opts.inReplyTo}`)
  if (opts.references && opts.references.length > 0) {
    lines.push(`References: ${opts.references.join(' ')}`)
  }

  lines.push('MIME-Version: 1.0')

  const hasAttachments = opts.attachments && opts.attachments.length > 0

  if (hasAttachments) {
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`)
    lines.push('')
    lines.push(`--${boundary}`)
    if (opts.bodyHtml) {
      lines.push('Content-Type: text/html; charset=utf-8')
      lines.push('Content-Transfer-Encoding: 8bit')
      lines.push('')
      lines.push(opts.bodyHtml)
    } else {
      lines.push('Content-Type: text/plain; charset=utf-8')
      lines.push('Content-Transfer-Encoding: 8bit')
      lines.push('')
      lines.push(opts.bodyText)
    }

    for (const att of opts.attachments || []) {
      lines.push(`--${boundary}`)
      lines.push(`Content-Type: ${att.mimeType || 'application/octet-stream'}; name="${att.filename}"`)
      lines.push(`Content-Disposition: attachment; filename="${att.filename}"`)
      lines.push('Content-Transfer-Encoding: base64')
      lines.push('')
      lines.push(att.contentBase64 || '')
    }
    lines.push(`--${boundary}--`)
  } else if (opts.bodyHtml) {
    lines.push('Content-Type: text/html; charset=utf-8')
    lines.push('Content-Transfer-Encoding: 8bit')
    lines.push('')
    lines.push(opts.bodyHtml)
  } else {
    lines.push('Content-Type: text/plain; charset=utf-8')
    lines.push('Content-Transfer-Encoding: 8bit')
    lines.push('')
    lines.push(opts.bodyText)
  }

  return lines.join('\r\n')
}
