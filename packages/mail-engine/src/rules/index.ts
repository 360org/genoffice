import type { ParsedEmail } from '../types'

export type RuleConditionField = 'from' | 'to' | 'subject' | 'body' | 'hasAttachments'
export type RuleConditionOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'matches'

export interface RuleCondition {
  field: RuleConditionField
  operator: RuleConditionOperator
  value: string | boolean
}

export interface RuleAction {
  type: 'moveToFolder' | 'markAsRead' | 'markAsStarred' | 'applyLabel' | 'autoReply'
  targetFolderId?: string
  label?: string
  replyTemplate?: string
}

export interface MailFilterRule {
  id: string
  name: string
  enabled: boolean
  matchAllConditions: boolean
  conditions: RuleCondition[]
  actions: RuleAction[]
}

export function evaluateCondition(email: ParsedEmail, cond: RuleCondition): boolean {
  if (cond.field === 'hasAttachments') {
    return email.flags.hasAttachments === Boolean(cond.value)
  }

  let textToMatch = ''
  switch (cond.field) {
    case 'from':
      textToMatch = `${email.from.name} ${email.from.address}`.toLowerCase()
      break
    case 'to':
      textToMatch = email.to.map((t) => `${t.name} ${t.address}`).join(' ').toLowerCase()
      break
    case 'subject':
      textToMatch = email.subject.toLowerCase()
      break
    case 'body':
      textToMatch = email.bodyText.toLowerCase()
      break
  }

  const searchVal = String(cond.value).toLowerCase()

  switch (cond.operator) {
    case 'contains':
      return textToMatch.includes(searchVal)
    case 'equals':
      return textToMatch === searchVal
    case 'startsWith':
      return textToMatch.startsWith(searchVal)
    case 'endsWith':
      return textToMatch.endsWith(searchVal)
    case 'matches':
      try {
        return new RegExp(searchVal, 'i').test(textToMatch)
      } catch {
        return false
      }
    default:
      return false
  }
}

export function applyRules(email: ParsedEmail, rules: MailFilterRule[]): RuleAction[] {
  const actionsToApply: RuleAction[] = []

  for (const rule of rules) {
    if (!rule.enabled || rule.conditions.length === 0) continue

    const matches = rule.matchAllConditions
      ? rule.conditions.every((c) => evaluateCondition(email, c))
      : rule.conditions.some((c) => evaluateCondition(email, c))

    if (matches) {
      actionsToApply.push(...rule.actions)
    }
  }

  return actionsToApply
}
