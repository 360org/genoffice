import React, { useState } from 'react'

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (draft: { to: string[]; subject: string; bodyHtml: string }) => void
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSend }) => {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  if (!isOpen) return null

  const handleSend = () => {
    onSend({
      to: to.split(',').map((s) => s.trim()).filter(Boolean),
      subject,
      bodyHtml: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
    })
    onClose()
  }

  const handleAiDraft = () => {
    if (!aiPrompt.trim()) return
    setIsGeneratingAi(true)
    setTimeout(() => {
      setSubject(`Phản hồi: ${aiPrompt}`)
      setBody(
        `Chào anh/chị,\n\nCảm ơn thông tin từ anh/chị. Về vấn đề "${aiPrompt}", tôi xin xác nhận và sẽ phản hồi chi tiết trước 17h hôm nay.\n\nTrân trọng,\nChâu Lê`
      )
      setIsGeneratingAi(false)
    }, 600)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--color-bg-overlay, rgba(0,0,0,0.4))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: '640px',
          backgroundColor: 'var(--surface)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-modal-strong, 0 10px 25px rgba(0,0,0,0.2))',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'var(--surface-subtle)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: '14px' }}>Soạn thư mới (New Message)</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              color: 'var(--text-muted)',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* AI Drafting Prompt */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              backgroundColor: 'var(--surface-subtle)',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
            }}
          >
            <input
              type="text"
              placeholder="✨ Yêu cầu VuaOffice AI viết nháp (VD: Viết mail xin nghỉ phép / Báo cáo tuần)..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiDraft()}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '12px',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={handleAiDraft}
              disabled={isGeneratingAi || !aiPrompt.trim()}
              style={{
                backgroundColor: '#0078d4',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {isGeneratingAi ? 'Đang viết...' : 'Tạo nháp AI'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '60px', fontSize: '13px', color: 'var(--text-secondary)' }}>Đến:</span>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="nguoinhan@company.com"
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '60px', fontSize: '13px', color: 'var(--text-secondary)' }}>Tiêu đề:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Chủ đề thư..."
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Nội dung thư..."
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              outline: 'none',
              resize: 'vertical',
              fontSize: '13px',
              lineHeight: '1.5',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '12px 16px',
            backgroundColor: 'var(--surface-subtle)',
            borderTop: '1px solid var(--border)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSend}
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#0078d4',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Gửi thư (Send)
          </button>
        </div>
      </div>
    </div>
  )
}
