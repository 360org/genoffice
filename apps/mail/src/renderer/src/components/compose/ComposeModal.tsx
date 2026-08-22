import React, { useState, useEffect, useRef } from 'react'
import {
  IconSparkles,
  IconX,
  IconLink,
  IconList,
  IconListOrdered,
  IconSend,
} from '../common/MailIcons'

interface ComposeModalProps {
  isOpen: boolean
  initialTo?: string
  initialSubject?: string
  initialBody?: string
  onClose: () => void
  onSend: (draft: { to: string[]; subject: string; bodyHtml: string }) => void
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  onClose,
  onSend,
}) => {
  const [to, setTo] = useState(initialTo)
  const [subject, setSubject] = useState(initialSubject)
  const [bodyHtml, setBodyHtml] = useState(initialBody ? `<p>${initialBody.replace(/\n/g, '<br/>')}</p>` : '<p></p>')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [lastAutoSaved, setLastAutoSaved] = useState<string | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTo(initialTo)
      setSubject(initialSubject)
      const formatted = initialBody ? `<p>${initialBody.replace(/\n/g, '<br/>')}</p>` : '<p></p>'
      setBodyHtml(formatted)
      if (editorRef.current) {
        editorRef.current.innerHTML = formatted
      }
    }
  }, [isOpen, initialTo, initialSubject, initialBody])

  // Periodic Auto-save timer (every 15s)
  useEffect(() => {
    if (!isOpen) return
    const timer = setInterval(() => {
      if (to.trim() || subject.trim() || (bodyHtml && bodyHtml !== '<p></p>')) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        setLastAutoSaved(timeStr)
      }
    }, 15000)
    return () => clearInterval(timer)
  }, [isOpen, to, subject, bodyHtml])

  if (!isOpen) return null

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setBodyHtml(editorRef.current.innerHTML)
    }
  }

  const handleSend = () => {
    const finalHtml = editorRef.current ? editorRef.current.innerHTML : bodyHtml
    onSend({
      to: to.split(',').map((s) => s.trim()).filter(Boolean),
      subject: subject || '(Không có chủ đề)',
      bodyHtml: finalHtml,
    })
    onClose()
  }

  const handleAiDraft = () => {
    if (!aiPrompt.trim()) return
    setIsGeneratingAi(true)
    setTimeout(() => {
      setSubject(`Phản hồi: ${aiPrompt}`)
      const aiGenerated = `<p>Kính gửi Quý đối tác / Anh/Chị,</p><p>Cảm ơn thông tin liên quan đến <strong>"${aiPrompt}"</strong>.</p><p>Tôi đã tiếp nhận yêu cầu và sẽ phối hợp xử lý dứt điểm trước 17h hôm nay.</p><p>Trân trọng cảm ơn,<br/><strong>Châu Lê</strong><br/><em>360 CORP / GenOffice Team</em></p>`
      setBodyHtml(aiGenerated)
      if (editorRef.current) {
        editorRef.current.innerHTML = aiGenerated
      }
      setIsGeneratingAi(false)
    }, 600)
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
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: '760px',
          height: '620px',
          backgroundColor: 'var(--surface, #ffffff)',
          color: 'var(--text-primary, #232425)',
          borderRadius: '8px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
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
            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary, #232425)' }}>Soạn thư mới (Outlook Rich-text Message)</span>
            {lastAutoSaved && (
              <span style={{ fontSize: '11px', color: 'var(--text-muted, #878e96)' }}>
                • Đã tự động lưu nháp lúc {lastAutoSaved}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #878e96)',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Modal Form Body */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflow: 'hidden', backgroundColor: 'var(--surface, #ffffff)' }}>
          {/* AI Drafting Prompt */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              backgroundColor: 'var(--surface-subtle, #f6f7f9)',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border, #e3e6ea)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
              <IconSparkles size={15} color="var(--mail-primary-blue, #0077cd)" />
              <input
                type="text"
                placeholder="Yêu cầu Genspark AI viết nháp thư..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiDraft()}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  color: 'var(--text-primary, #232425)',
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleAiDraft}
              disabled={isGeneratingAi || !aiPrompt.trim()}
              style={{
                backgroundColor: 'var(--mail-primary-blue, #0077cd)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '5px',
                padding: '6px 14px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {isGeneratingAi ? 'Đang viết...' : 'Tạo nháp AI'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '60px', fontSize: '13px', color: 'var(--text-secondary, #606366)', fontWeight: 500 }}>Đến:</span>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="nguoinhan@company.com"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '5px',
                border: '1px solid var(--border, #e3e6ea)',
                background: 'var(--surface, #ffffff)',
                color: 'var(--text-primary, #232425)',
                outline: 'none',
                fontSize: '13px',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '60px', fontSize: '13px', color: 'var(--text-secondary, #606366)', fontWeight: 500 }}>Tiêu đề:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Chủ đề thư..."
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '5px',
                border: '1px solid var(--border, #e3e6ea)',
                background: 'var(--surface, #ffffff)',
                color: 'var(--text-primary, #232425)',
                outline: 'none',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Rich-text Toolbar */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '6px 10px',
              backgroundColor: 'var(--surface-subtle, #f6f7f9)',
              borderRadius: '5px',
              border: '1px solid var(--border, #e3e6ea)',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => execCmd('bold')}
              title="Đậm (Bold)"
              style={{ padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer', background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e3e6ea)', borderRadius: '4px', color: 'var(--text-primary, #232425)' }}
            >
              B
            </button>
            <button
              type="button"
              onClick={() => execCmd('italic')}
              title="Nghiêng (Italic)"
              style={{ padding: '4px 10px', fontStyle: 'italic', cursor: 'pointer', background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e3e6ea)', borderRadius: '4px', color: 'var(--text-primary, #232425)' }}
            >
              I
            </button>
            <button
              type="button"
              onClick={() => execCmd('underline')}
              title="Gạch chân (Underline)"
              style={{ padding: '4px 10px', textDecoration: 'underline', cursor: 'pointer', background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e3e6ea)', borderRadius: '4px', color: 'var(--text-primary, #232425)' }}
            >
              U
            </button>
            <button
              type="button"
              onClick={() => execCmd('strikeThrough')}
              title="Gạch ngang (Strikethrough)"
              style={{ padding: '4px 10px', textDecoration: 'line-through', cursor: 'pointer', background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e3e6ea)', borderRadius: '4px', color: 'var(--text-primary, #232425)' }}
            >
              S
            </button>
            <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border, #e3e6ea)', margin: '0 4px' }} />
            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              title="Danh sách dấu chấm"
              style={{ padding: '4px 8px', cursor: 'pointer', background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e3e6ea)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary, #232425)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <IconList size={13} />
              <span>Gạch đầu dòng</span>
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertOrderedList')}
              title="Danh sách số"
              style={{ padding: '4px 8px', cursor: 'pointer', background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e3e6ea)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary, #232425)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <IconListOrdered size={13} />
              <span>Đánh số</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const url = prompt('Nhập đường dẫn liên kết:')
                if (url) execCmd('createLink', url)
              }}
              title="Thêm liên kết"
              style={{ padding: '4px 8px', cursor: 'pointer', background: 'var(--surface, #ffffff)', border: '1px solid var(--border, #e3e6ea)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-primary, #232425)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <IconLink size={13} />
              <span>Liên kết</span>
            </button>
          </div>

          {/* Rich ContentEditable Body */}
          <div
            ref={editorRef}
            contentEditable
            onInput={() => {
              if (editorRef.current) {
                setBodyHtml(editorRef.current.innerHTML)
              }
            }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '5px',
              border: '1px solid var(--border, #e3e6ea)',
              background: 'var(--surface, #ffffff)',
              color: 'var(--text-primary, #232425)',
              outline: 'none',
              overflowY: 'auto',
              fontSize: '13px',
              lineHeight: '1.6',
            }}
          />
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '12px 18px',
            backgroundColor: 'var(--surface-subtle, #f6f7f9)',
            borderTop: '1px solid var(--border, #e3e6ea)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '5px',
              border: '1px solid var(--border, #e3e6ea)',
              background: 'var(--surface, #ffffff)',
              color: 'var(--text-primary, #232425)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSend}
            style={{
              padding: '8px 20px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: 'var(--mail-primary-blue, #0077cd)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 5px rgba(0,119,205,0.25)',
            }}
          >
            <IconSend size={14} color="#ffffff" />
            <span>Gửi thư (Send)</span>
          </button>
        </div>
      </div>
    </div>
  )
}

