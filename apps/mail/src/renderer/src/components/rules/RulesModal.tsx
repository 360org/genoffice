import React, { useState } from 'react'
import type { MailFilterRule, RuleCondition, RuleAction } from '@genoffice/mail-engine'
import {
  IconLightning,
  IconPlus,
  IconTrash,
  IconX,
  IconRefresh,
  IconCheck,
} from '../common/MailIcons'

interface RulesModalProps {
  isOpen: boolean
  onClose: () => void
  rules: MailFilterRule[]
  onSaveRules: (rules: MailFilterRule[]) => void
  onRunRulesNow?: (rules: MailFilterRule[]) => void
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  rules: initialRules,
  onSaveRules,
  onRunRulesNow,
}) => {
  const [rules, setRules] = useState<MailFilterRule[]>(initialRules)
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(
    initialRules[0]?.id || null
  )
  const [isRunning, setIsRunning] = useState(false)
  const [runSuccessMsg, setRunSuccessMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const selectedRule = rules.find((r) => r.id === selectedRuleId) || rules[0] || null

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const handleAddRule = () => {
    const newRule: MailFilterRule = {
      id: `rule_${Date.now()}`,
      name: `Quy tắc mới ${rules.length + 1}`,
      enabled: true,
      matchAllConditions: true,
      conditions: [{ field: 'subject', operator: 'contains', value: '' }],
      actions: [{ type: 'markAsStarred' }],
    }
    setRules((prev) => [...prev, newRule])
    setSelectedRuleId(newRule.id)
  }

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
    if (selectedRuleId === id) {
      setSelectedRuleId(null)
    }
  }

  const handleUpdateRuleName = (name: string) => {
    if (!selectedRule) return
    setRules((prev) =>
      prev.map((r) => (r.id === selectedRule.id ? { ...r, name } : r))
    )
  }

  const handleToggleMatchAll = (matchAll: boolean) => {
    if (!selectedRule) return
    setRules((prev) =>
      prev.map((r) => (r.id === selectedRule.id ? { ...r, matchAllConditions: matchAll } : r))
    )
  }

  const handleAddCondition = () => {
    if (!selectedRule) return
    const newCond: RuleCondition = { field: 'from', operator: 'contains', value: '' }
    setRules((prev) =>
      prev.map((r) =>
        r.id === selectedRule.id
          ? { ...r, conditions: [...r.conditions, newCond] }
          : r
      )
    )
  }

  const handleRemoveCondition = (idx: number) => {
    if (!selectedRule) return
    setRules((prev) =>
      prev.map((r) =>
        r.id === selectedRule.id
          ? { ...r, conditions: r.conditions.filter((_, i) => i !== idx) }
          : r
      )
    )
  }

  const handleAddAction = () => {
    if (!selectedRule) return
    const newAct: RuleAction = { type: 'markAsRead' }
    setRules((prev) =>
      prev.map((r) =>
        r.id === selectedRule.id
          ? { ...r, actions: [...r.actions, newAct] }
          : r
      )
    )
  }

  const handleRemoveAction = (idx: number) => {
    if (!selectedRule) return
    setRules((prev) =>
      prev.map((r) =>
        r.id === selectedRule.id
          ? { ...r, actions: r.actions.filter((_, i) => i !== idx) }
          : r
      )
    )
  }

  const handleExecuteRunNow = () => {
    if (!onRunRulesNow) return
    setIsRunning(true)
    onRunRulesNow(rules)
    setTimeout(() => {
      setIsRunning(false)
      setRunSuccessMsg('Đã áp dụng toàn bộ quy tắc thành công trên Hộp thư!')
      setTimeout(() => setRunSuccessMsg(null), 3000)
    }, 400)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
    >
      <div
        style={{
          width: '780px',
          height: '560px',
          backgroundColor: 'var(--surface, #ffffff)',
          borderRadius: '8px',
          boxShadow: '0 16px 36px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border, #e3e6ea)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: 'var(--surface-subtle, #f6f7f9)',
            borderBottom: '1px solid var(--border, #e3e6ea)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconLightning size={16} color="var(--mail-primary-blue, #0077cd)" />
            <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary, #232425)' }}>
              Quản lý Quy tắc & Bộ lọc Tự động (Outlook Mail Rules)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #878e96)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Body Split */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Rules List Sidebar */}
          <div
            style={{
              width: '260px',
              borderRight: '1px solid var(--border, #e3e6ea)',
              backgroundColor: 'var(--surface-subtle, #f6f7f9)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '10px', borderBottom: '1px solid var(--border, #e3e6ea)' }}>
              <button
                type="button"
                onClick={handleAddRule}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  backgroundColor: 'var(--mail-primary-blue, #0077cd)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <IconPlus size={14} />
                <span>Tạo quy tắc mới</span>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {rules.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRuleId(r.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '5px',
                    backgroundColor:
                      selectedRule?.id === r.id ? 'var(--mail-primary-blue-soft, #e5f3fc)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    borderLeft: selectedRule?.id === r.id ? '3px solid var(--mail-primary-blue, #0077cd)' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <input
                      type="checkbox"
                      checked={r.enabled}
                      onChange={(e) => {
                        e.stopPropagation()
                        handleToggleRule(r.id)
                      }}
                      title={r.enabled ? 'Đang bật quy tắc' : 'Đang tắt quy tắc'}
                    />
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: selectedRule?.id === r.id ? 600 : 500,
                        color: r.enabled ? 'var(--text-primary, #232425)' : 'var(--text-muted, #878e96)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteRule(r.id)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--danger, #d13438)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                    }}
                    title="Xóa quy tắc"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              ))}
              {rules.length === 0 && (
                <div style={{ padding: '20px 10px', fontSize: '12px', color: 'var(--text-muted, #878e96)', textAlign: 'center' }}>
                  Chưa có quy tắc lọc nào. Nhấp "+ Tạo quy tắc mới" để bắt đầu.
                </div>
              )}
            </div>
          </div>

          {/* Rule Detail Form */}
          <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--surface, #ffffff)' }}>
            {selectedRule ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>Tên quy tắc:</label>
                  <input
                    type="text"
                    value={selectedRule.name}
                    onChange={(e) => handleUpdateRuleName(e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '5px',
                      border: '1px solid var(--border, #e3e6ea)',
                      backgroundColor: 'var(--surface, #ffffff)',
                      color: 'var(--text-primary, #232425)',
                      fontSize: '12.5px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Match Mode (All vs Any) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '6px 10px', backgroundColor: 'var(--surface-subtle, #f6f7f9)', borderRadius: '5px', border: '1px solid var(--border, #e3e6ea)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>Khớp điều kiện:</span>
                  <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="matchMode"
                      checked={selectedRule.matchAllConditions}
                      onChange={() => handleToggleMatchAll(true)}
                    />
                    <span>Khớp tất cả (AND)</span>
                  </label>
                  <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="matchMode"
                      checked={!selectedRule.matchAllConditions}
                      onChange={() => handleToggleMatchAll(false)}
                    />
                    <span>Khớp bất kỳ (OR)</span>
                  </label>
                </div>

                {/* Conditions Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>Khi thư nhận được thỏa mãn (Conditions):</span>
                    <button
                      type="button"
                      onClick={handleAddCondition}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--mail-primary-blue, #0077cd)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      + Thêm điều kiện
                    </button>
                  </div>

                  {selectedRule.conditions.map((cond, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        backgroundColor: 'var(--surface-subtle, #f6f7f9)',
                        padding: '6px 8px',
                        borderRadius: '5px',
                        border: '1px solid var(--border, #e3e6ea)',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', width: '20px' }}>Nếu</span>
                      <select
                        value={cond.field}
                        onChange={(e) => {
                          const val = e.target.value as any
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === selectedRule.id
                                ? {
                                    ...r,
                                    conditions: r.conditions.map((c, i) =>
                                      i === idx ? { ...c, field: val } : c
                                    ),
                                  }
                                : r
                            )
                          )
                        }}
                        style={{ fontSize: '11.5px', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border, #e3e6ea)', background: 'var(--surface, #ffffff)', outline: 'none' }}
                      >
                        <option value="from">Người gửi (From)</option>
                        <option value="to">Người nhận (To)</option>
                        <option value="subject">Tiêu đề (Subject)</option>
                        <option value="body">Nội dung thư (Body)</option>
                        <option value="hasAttachments">Có tệp đính kèm</option>
                      </select>

                      <select
                        value={cond.operator}
                        onChange={(e) => {
                          const val = e.target.value as any
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === selectedRule.id
                                ? {
                                    ...r,
                                    conditions: r.conditions.map((c, i) =>
                                      i === idx ? { ...c, operator: val } : c
                                    ),
                                  }
                                : r
                            )
                          )
                        }}
                        style={{ fontSize: '11.5px', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--border, #e3e6ea)', background: 'var(--surface, #ffffff)', outline: 'none' }}
                      >
                        <option value="contains">chứa</option>
                        <option value="equals">bằng chính xác</option>
                        <option value="startsWith">bắt đầu với</option>
                        <option value="endsWith">kết thúc với</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Nhập chuỗi so khớp..."
                        value={String(cond.value)}
                        onChange={(e) => {
                          const val = e.target.value
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === selectedRule.id
                                ? {
                                    ...r,
                                    conditions: r.conditions.map((c, i) =>
                                      i === idx ? { ...c, value: val } : c
                                    ),
                                  }
                                : r
                            )
                          )
                        }}
                        style={{
                          flex: 1,
                          fontSize: '11.5px',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border, #e3e6ea)',
                          backgroundColor: 'var(--surface, #ffffff)',
                          color: 'var(--text-primary, #232425)',
                          outline: 'none',
                        }}
                      />

                      {selectedRule.conditions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCondition(idx)}
                          style={{ border: 'none', background: 'none', color: 'var(--danger, #d13438)', cursor: 'pointer', padding: '2px' }}
                          title="Xóa điều kiện này"
                        >
                          <IconX size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>Thực hiện hành động sau (Actions):</span>
                    <button
                      type="button"
                      onClick={handleAddAction}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--mail-primary-blue, #0077cd)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      + Thêm hành động
                    </button>
                  </div>

                  {selectedRule.actions.map((act, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        backgroundColor: 'var(--surface-subtle, #f6f7f9)',
                        padding: '6px 8px',
                        borderRadius: '5px',
                        border: '1px solid var(--border, #e3e6ea)',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)', width: '20px' }}>Thì</span>
                      <select
                        value={act.type}
                        onChange={(e) => {
                          const val = e.target.value as any
                          setRules((prev) =>
                            prev.map((r) =>
                              r.id === selectedRule.id
                                ? {
                                    ...r,
                                    actions: r.actions.map((a, i) =>
                                      i === idx ? { ...a, type: val } : a
                                    ),
                                  }
                                : r
                            )
                          )
                        }}
                        style={{ flex: 1, fontSize: '11.5px', padding: '5px 8px', borderRadius: '4px', border: '1px solid var(--border, #e3e6ea)', background: 'var(--surface, #ffffff)', outline: 'none' }}
                      >
                        <option value="markAsStarred">Gắn cờ theo dõi / Dấu sao (Flag / Star)</option>
                        <option value="markAsRead">Đánh dấu là Đã đọc</option>
                        <option value="moveToFolder">Di chuyển vào Lưu trữ (Archive)</option>
                        <option value="applyLabel">Đưa vào Hộp thư Ưu tiên (Focused)</option>
                      </select>

                      {selectedRule.actions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAction(idx)}
                          style={{ border: 'none', background: 'none', color: 'var(--danger, #d13438)', cursor: 'pointer', padding: '2px' }}
                          title="Xóa hành động này"
                        >
                          <IconX size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted, #878e96)', fontSize: '13px' }}>
                Chọn một quy tắc hoặc tạo quy tắc mới để thiết lập điều kiện lọc.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: 'var(--surface-subtle, #f6f7f9)',
            borderTop: '1px solid var(--border, #e3e6ea)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleExecuteRunNow}
              disabled={isRunning || rules.length === 0}
              style={{
                padding: '6px 12px',
                borderRadius: '5px',
                border: '1px solid var(--border, #e3e6ea)',
                backgroundColor: 'var(--surface, #ffffff)',
                color: 'var(--text-primary, #232425)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Thực thi quét và áp dụng quy tắc ngay lập tức trên các email hiện có (Outlook Run Rules Now)"
            >
              <IconRefresh size={13} className={isRunning ? 'spinning' : ''} />
              <span>{isRunning ? 'Đang chạy...' : 'Chạy quy tắc ngay (Run Rules Now)'}</span>
            </button>
            {runSuccessMsg && (
              <span style={{ fontSize: '12px', color: 'var(--success, #107c41)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <IconCheck size={13} />
                <span>{runSuccessMsg}</span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 14px',
                borderRadius: '5px',
                border: '1px solid var(--border, #e3e6ea)',
                backgroundColor: 'var(--surface, #ffffff)',
                color: 'var(--text-primary, #232425)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                onSaveRules(rules)
                onClose()
              }}
              style={{
                padding: '6px 18px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: 'var(--mail-primary-blue, #0077cd)',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: '0 1px 3px rgba(0,119,205,0.3)',
              }}
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

