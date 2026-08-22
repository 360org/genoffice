import type { ParsedEmail } from '../types'

export interface ThreadNode {
  message: ParsedEmail
  children: ThreadNode[]
}

export interface ConversationThread {
  threadId: string
  subject: string
  lastDate: number
  participants: string[]
  messageCount: number
  unreadCount: number
  hasAttachments: boolean
  messages: ParsedEmail[]
}

export function groupIntoThreads(messages: ParsedEmail[]): ConversationThread[] {
  const threadMap = new Map<string, ParsedEmail[]>()

  for (const msg of messages) {
    const key = msg.threadId || msg.messageId
    const existing = threadMap.get(key)
    if (existing) existing.push(msg)
    else threadMap.set(key, [msg])
  }

  const threads: ConversationThread[] = []

  for (const [threadId, msgs] of threadMap.entries()) {
    msgs.sort((a, b) => a.date - b.date)
    const latest = msgs[msgs.length - 1]
    const participantsSet = new Set<string>()

    let unreadCount = 0
    let hasAttachments = false

    for (const m of msgs) {
      if (m.from.address) participantsSet.add(m.from.name || m.from.address)
      for (const t of m.to) if (t.address) participantsSet.add(t.name || t.address)
      if (m.flags.unread) unreadCount++
      if (m.flags.hasAttachments) hasAttachments = true
    }

    threads.push({
      threadId,
      subject: latest.subject.replace(/^(re:\s*|fwd:\s*)+/i, '').trim(),
      lastDate: latest.date,
      participants: Array.from(participantsSet),
      messageCount: msgs.length,
      unreadCount,
      hasAttachments,
      messages: msgs,
    })
  }

  return threads.sort((a, b) => b.lastDate - a.lastDate)
}
