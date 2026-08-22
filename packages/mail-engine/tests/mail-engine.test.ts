import { describe, expect, it } from 'vitest'
import { parseEml, buildEml, groupIntoThreads, applyRules } from '../src'

describe('mail-engine', () => {
  it('parses and builds EML RFC822 messages accurately', () => {
    const raw = [
      'From: "CEO John" <ceo@360.org.vn>',
      'To: "Alice" <alice@example.com>',
      'Subject: Project Kickoff Meeting',
      'Date: Sat, 15 Aug 2026 12:00:00 GMT',
      'Message-ID: <msg-123@genoffice>',
      'Content-Type: text/plain; charset=utf-8',
      '',
      'Hello team, let us meet tomorrow.',
    ].join('\r\n')

    const parsed = parseEml(raw)
    expect(parsed.subject).toBe('Project Kickoff Meeting')
    expect(parsed.from.address).toBe('ceo@360.org.vn')
    expect(parsed.from.name).toBe('CEO John')
    expect(parsed.to[0].address).toBe('alice@example.com')
    expect(parsed.bodyText).toContain('Hello team')

    const rebuilt = buildEml({
      from: parsed.from,
      to: parsed.to,
      subject: parsed.subject,
      bodyText: parsed.bodyText,
    })
    expect(rebuilt).toContain('From: "CEO John" <ceo@360.org.vn>')
    expect(rebuilt).toContain('Subject: Project Kickoff Meeting')
  })

  it('threads conversation messages correctly', () => {
    const msg1 = parseEml(
      'From: a@test.com\nTo: b@test.com\nSubject: Hi\nMessage-ID: <1@test.com>\n\nFirst message',
    )
    const msg2 = parseEml(
      'From: b@test.com\nTo: a@test.com\nSubject: Re: Hi\nMessage-ID: <2@test.com>\nIn-Reply-To: <1@test.com>\n\nSecond message',
    )

    const threads = groupIntoThreads([msg1, msg2])
    expect(threads).toHaveLength(1)
    expect(threads[0].messageCount).toBe(2)
    expect(threads[0].subject).toBe('Hi')
  })

  it('evaluates mail filter rules', () => {
    const email = parseEml(
      'From: boss@corp.com\nTo: me@corp.com\nSubject: Urgent Report\n\nPlease submit now.',
    )

    const actions = applyRules(email, [
      {
        id: 'r1',
        name: 'Star Urgent',
        enabled: true,
        matchAllConditions: true,
        conditions: [{ field: 'subject', operator: 'contains', value: 'urgent' }],
        actions: [{ type: 'markAsStarred' }],
      },
    ])

    expect(actions).toHaveLength(1)
    expect(actions[0].type).toBe('markAsStarred')
  })
})
