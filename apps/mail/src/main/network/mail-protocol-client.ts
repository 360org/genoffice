import * as tls from 'node:tls'
import * as net from 'node:net'
import { parseEml, buildEml } from '@genoffice/mail-engine'

export interface ImapAuthOptions {
  host: string
  port?: number
  tls?: boolean
  user: string
  pass?: string
  accessToken?: string
  authType: 'oauth2' | 'app_password' | 'password'
}

export interface SmtpAuthOptions {
  host: string
  port?: number
  tls?: boolean
  user: string
  pass?: string
  accessToken?: string
  authType: 'oauth2' | 'app_password' | 'password'
}

export interface FetchedMailItem {
  uid: string
  from: string
  to: string
  subject: string
  dateIso: string
  snippet: string
  bodyHtml?: string
  plainText?: string
  hasAttachments?: boolean
  attachments?: Array<{
    id: string
    filename: string
    mimeType: string
    sizeBytes: number
    contentBase64?: string
  }>
}

/**
 * Builds RFC 6161 / SASL XOAUTH2 token buffer string
 * Format: base64("user=" + userName + "^Aauth=Bearer " + accessToken + "^A^A")
 */
export function buildXOAuth2Token(user: string, accessToken: string): string {
  const authString = `user=${user}\x01auth=Bearer ${accessToken}\x01\x01`
  return Buffer.from(authString).toString('base64')
}

/**
 * Native IMAP Client Engine using Node.js TLS/TCP sockets
 * Implements standard IMAP RFC3501 & RFC6161 XOAUTH2 state machine:
 * CAPABILITY -> AUTHENTICATE XOAUTH2 / LOGIN -> SELECT -> SEARCH/FETCH -> LOGOUT
 */
export class NativeImapClient {
  private socket: tls.TLSSocket | net.Socket | null = null
  private tagCounter = 1
  private buffer = ''

  constructor(private config: ImapAuthOptions) {}

  private nextTag(): string {
    return `A${this.tagCounter++}`
  }

  async connectAndFetchRecent(folderName = 'INBOX', limit = 10): Promise<FetchedMailItem[]> {
    return new Promise((resolve, reject) => {
      const port = this.config.port || (this.config.tls !== false ? 993 : 143)
      const useTls = this.config.tls !== false

      const timeoutTimer = setTimeout(() => {
        this.close()
        reject(new Error(`IMAP connection timeout tới ${this.config.host}:${port}`))
      }, 10000)

      try {
        const options: tls.ConnectionOptions = {
          host: this.config.host,
          port,
          rejectUnauthorized: false,
          timeout: 8000,
        }

        const onConnect = () => {
          // Socket connected, wait for IMAP greeting
        }

        if (useTls) {
          this.socket = tls.connect(options, onConnect)
        } else {
          this.socket = net.connect({ host: this.config.host, port }, onConnect)
        }

        this.socket.setEncoding('utf8')

        this.socket.on('data', (chunk: string) => {
          this.buffer += chunk

          // 1. Initial Greeting -> Initiate Authentication
          if (this.buffer.includes('* OK')) {
            const loginTag = this.nextTag()
            if (this.config.authType === 'oauth2' && this.config.accessToken) {
              const xoauth2Str = buildXOAuth2Token(this.config.user, this.config.accessToken)
              this.sendCommand(`${loginTag} AUTHENTICATE XOAUTH2 ${xoauth2Str}\r\n`)
            } else if (this.config.pass) {
              this.sendCommand(`${loginTag} LOGIN "${this.config.user}" "${this.config.pass}"\r\n`)
            } else {
              clearTimeout(timeoutTimer)
              this.close()
              reject(new Error('Không có thông tin xác thực IMAP (Password hoặc Token)'))
              return
            }
          }

          // 2. Authentication Success -> SELECT folder
          if (this.buffer.includes('OK Success') || this.buffer.includes('OK LOGIN') || this.buffer.includes('OK [CAPABILITY')) {
            const selectTag = this.nextTag()
            this.sendCommand(`${selectTag} SELECT "${folderName}"\r\n`)
          }

          // 3. Folder Selected -> FETCH recent emails
          if (this.buffer.includes('OK [READ-WRITE]') || this.buffer.includes('OK [READ-ONLY]') || this.buffer.includes('OK [SELECT')) {
            const fetchTag = this.nextTag()
            this.sendCommand(`${fetchTag} FETCH 1:${limit} (BODY.PEEK[])\r\n`)
          }

          // 4. Parse FETCH Response
          if (this.buffer.includes('FETCH') && this.buffer.includes('OK FETCH')) {
            clearTimeout(timeoutTimer)
            const parsedItems = this.parseImapFetchResponse(this.buffer)
            this.close()
            resolve(parsedItems)
          }

          // 5. Authentication or Protocol Error
          if (this.buffer.includes('NO [AUTHENTICATIONFAILED]') || this.buffer.includes('NO Login failed') || this.buffer.includes('BAD Invalid command')) {
            clearTimeout(timeoutTimer)
            this.close()
            reject(new Error(`IMAP Authentication Error: ${this.buffer.trim()}`))
          }
        })

        this.socket.on('error', (err) => {
          clearTimeout(timeoutTimer)
          this.close()
          reject(err)
        })

        this.socket.on('timeout', () => {
          clearTimeout(timeoutTimer)
          this.close()
          reject(new Error(`IMAP Socket timeout kết nối tới ${this.config.host}`))
        })
      } catch (err) {
        clearTimeout(timeoutTimer)
        this.close()
        reject(err)
      }
    })
  }

  private sendCommand(cmd: string): void {
    if (this.socket && !this.socket.destroyed) {
      this.socket.write(cmd)
    }
  }

  private close(): void {
    if (this.socket) {
      try {
        this.socket.destroy()
      } catch {}
      this.socket = null
    }
  }

  private parseImapFetchResponse(raw: string): FetchedMailItem[] {
    const items: FetchedMailItem[] = []
    const rawChunks = raw.split(/\* \d+ FETCH/i)
    for (let i = 1; i < rawChunks.length; i++) {
      try {
        const chunk = rawChunks[i]
        const headerIndex = chunk.indexOf('From:')
        if (headerIndex >= 0) {
          const emlContent = chunk.slice(headerIndex)
          const parsed = parseEml(emlContent)
          items.push({
            uid: `imap_${parsed.messageId ? parsed.messageId.replace(/[^a-zA-Z0-9]/g, '_') : Date.now() + '_' + i}`,
            from: parsed.from.address || parsed.from.name || 'unknown@domain',
            to: parsed.to.map((t) => t.address).join(', ') || this.config.user,
            subject: parsed.subject,
            dateIso: new Date(parsed.date).toISOString(),
            snippet: parsed.snippet,
            bodyHtml: parsed.bodyHtml,
            plainText: parsed.bodyText,
            hasAttachments: parsed.attachments.length > 0,
            attachments: parsed.attachments.map((a) => ({
              id: a.id,
              filename: a.filename,
              mimeType: a.mimeType,
              sizeBytes: a.sizeBytes,
              contentBase64: a.contentBase64,
            })),
          })
        }
      } catch {}
    }
    return items
  }
}

/**
 * Native SMTP Client Engine using Node.js Sockets
 * Implements complete RFC5321 & RFC6161 SASL XOAUTH2 state machine:
 * EHLO -> AUTH LOGIN / AUTH XOAUTH2 -> MAIL FROM -> RCPT TO -> DATA -> QUIT
 */
export class NativeSmtpClient {
  constructor(private config: SmtpAuthOptions) {}

  async sendMail(mail: {
    from: string
    to: string[]
    subject: string
    bodyHtml: string
    bodyText?: string
    attachments?: Array<{ filename: string; contentBase64?: string; mimeType?: string }>
  }): Promise<{ success: boolean; messageId: string; response?: string }> {
    return new Promise((resolve, reject) => {
      const messageId = `<vua-${Date.now()}@${this.config.host || '360.org.vn'}>`
      const port = this.config.port || (this.config.tls !== false ? 465 : 587)
      const useTls = this.config.tls !== false

      const rawEml = buildEml({
        from: { address: mail.from, name: mail.from.split('@')[0] },
        to: mail.to.map((addr) => ({ address: addr, name: addr.split('@')[0] })),
        subject: mail.subject,
        bodyText: mail.bodyText || mail.bodyHtml.replace(/<[^>]*>/g, ' '),
        bodyHtml: mail.bodyHtml,
        attachments: mail.attachments?.map((a, idx) => ({
          id: `att_${idx}`,
          filename: a.filename,
          mimeType: a.mimeType || 'application/octet-stream',
          sizeBytes: a.contentBase64 ? Buffer.from(a.contentBase64, 'base64').length : 0,
          contentBase64: a.contentBase64,
        })),
      })

      const timeoutTimer = setTimeout(() => {
        reject(new Error(`SMTP Connection Timeout tới ${this.config.host}:${port}`))
      }, 12000)

      try {
        let socket: tls.TLSSocket | net.Socket
        let step = 0

        const handleData = (chunk: string) => {
          // 1. Initial Greeting (220) -> EHLO
          if (step === 0 && chunk.startsWith('220')) {
            step++
            socket.write(`EHLO ${this.config.host || 'localhost'}\r\n`)
          }
          // 2. EHLO response (250) -> AUTH XOAUTH2 / AUTH LOGIN
          else if (step === 1 && chunk.startsWith('250')) {
            step++
            if (this.config.authType === 'oauth2' && this.config.accessToken) {
              const xoauth2Str = buildXOAuth2Token(this.config.user, this.config.accessToken)
              socket.write(`AUTH XOAUTH2 ${xoauth2Str}\r\n`)
            } else if (this.config.pass) {
              socket.write(`AUTH LOGIN\r\n`)
            } else {
              // No Auth (internal relay) -> Proceed to MAIL FROM
              step = 4
              socket.write(`MAIL FROM:<${mail.from}>\r\n`)
            }
          }
          // 3a. AUTH LOGIN user prompt (334)
          else if (step === 2 && chunk.startsWith('334')) {
            step++
            const userBase64 = Buffer.from(this.config.user).toString('base64')
            socket.write(`${userBase64}\r\n`)
          }
          // 3b. AUTH LOGIN pass prompt (334)
          else if (step === 3 && chunk.startsWith('334')) {
            step++
            const passBase64 = Buffer.from(this.config.pass || '').toString('base64')
            socket.write(`${passBase64}\r\n`)
          }
          // 4. Auth Success (235) / MAIL FROM OK (250) -> MAIL FROM / RCPT TO
          else if ((step === 2 || step === 4) && (chunk.startsWith('235') || chunk.startsWith('250'))) {
            step = 5
            socket.write(`MAIL FROM:<${mail.from}>\r\n`)
          }
          // 5. MAIL FROM OK -> RCPT TO
          else if (step === 5 && chunk.startsWith('250')) {
            step++
            socket.write(`RCPT TO:<${mail.to[0]}>\r\n`)
          }
          // 6. RCPT TO OK -> DATA
          else if (step === 6 && chunk.startsWith('250')) {
            step++
            socket.write(`DATA\r\n`)
          }
          // 7. Ready for Data (354) -> Send EML Content
          else if (step === 7 && chunk.startsWith('354')) {
            step++
            socket.write(`${rawEml}\r\n.\r\n`)
          }
          // 8. Completed (250) -> QUIT
          else if (step === 8 && chunk.startsWith('250')) {
            step++
            socket.write(`QUIT\r\n`)
            clearTimeout(timeoutTimer)
            socket.destroy()
            resolve({
              success: true,
              messageId,
              response: '250 2.0.0 OK Sent via Live SMTP Socket',
            })
          }
          // Errors (5xx, 4xx)
          else if (chunk.startsWith('5') || chunk.startsWith('4')) {
            clearTimeout(timeoutTimer)
            socket.destroy()
            reject(new Error(`SMTP Protocol Error: ${chunk.trim()}`))
          }
        }

        if (useTls) {
          socket = tls.connect({ host: this.config.host, port, rejectUnauthorized: false }, () => {})
        } else {
          socket = net.connect({ host: this.config.host, port }, () => {})
        }

        socket.setEncoding('utf8')
        socket.on('data', handleData)
        socket.on('error', (err) => {
          clearTimeout(timeoutTimer)
          socket.destroy()
          reject(err)
        })
      } catch (err) {
        clearTimeout(timeoutTimer)
        reject(err)
      }
    })
  }
}
