export interface MailAddress {
  name: string
  address: string
}

export interface MailAttachment {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
  contentBase64?: string
  contentId?: string
}

export interface ParsedEmail {
  messageId: string
  threadId: string
  inReplyTo?: string
  references: string[]
  subject: string
  from: MailAddress
  to: MailAddress[]
  cc: MailAddress[]
  bcc: MailAddress[]
  replyTo?: MailAddress
  date: number
  bodyText: string
  bodyHtml?: string
  snippet: string
  attachments: MailAttachment[]
  headers: Record<string, string | string[]>
  flags: {
    unread: boolean
    starred: boolean
    draft: boolean
    hasAttachments: boolean
  }
}
