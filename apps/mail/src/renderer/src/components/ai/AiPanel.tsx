import React, { useState, useRef, useEffect } from 'react'
import type { EmailMessage } from '../../../../shared/types'
import { GensparkMark } from '../ribbon/GensparkMark'
import {
  IconMail,
  IconSparkles,
  IconReply,
  IconCheckSquare,
  IconSend,
  IconRefresh,
  IconX,
} from '../common/MailIcons'

interface AiPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedEmail: EmailMessage | null
  onApplyReply: (replyText: string) => void
  onCreateTask: (taskTitle: string) => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export const AiPanel: React.FC<AiPanelProps> = ({
  isOpen,
  onClose,
  selectedEmail,
  onApplyReply: _onApplyReply,
  onCreateTask: _onCreateTask,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm_welcome',
      role: 'assistant',
      content:
        'Xin chào Sếp! Em là Genspark AI Mail Agent. Em có thể giúp Sếp tóm tắt nội dung email, soạn thư trả lời chuyên nghiệp, trích xuất việc cần làm (To-Do) hoặc lên lịch họp Calendar.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [panelWidth, setPanelWidth] = useState(340)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(340)

  // Resizing logic for AI Dock
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const delta = startXRef.current - e.clientX
      const newWidth = Math.min(Math.max(280, startWidthRef.current + delta), 540)
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const handleStartResize = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    startXRef.current = e.clientX
    startWidthRef.current = panelWidth
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const activeStreamIdRef = useRef<string | null>(null)

  // Listen to incoming AI stream chunks from main process
  useEffect(() => {
    if (!window.vuaMail?.onAiStream) return
    const unsub = window.vuaMail.onAiStream((chunk: any) => {
      if (!chunk || chunk.requestId !== activeStreamIdRef.current) return

      if (chunk.type === 'delta' && chunk.text) {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant') return prev
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content: last.content + chunk.text,
            },
          ]
        })
      } else if (chunk.type === 'done') {
        setIsProcessing(false)
        activeStreamIdRef.current = null
      } else if (chunk.type === 'error') {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant') return prev
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content: last.content
                ? `${last.content}\n\n[Lỗi: ${chunk.error || 'Mất kết nối AI'}]`
                : `Không thể hoàn tất phản hồi từ AI Vendor: ${chunk.error || 'Lỗi kết nối hoặc API Key chưa được cài đặt.'}`,
            },
          ]
        })
        setIsProcessing(false)
        activeStreamIdRef.current = null
      }
    })

    return () => {
      unsub()
    }
  }, [])

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery
    if (!query.trim() || isProcessing) return

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const aiMsgId = `a_${Date.now()}`
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg, aiMsg])
    setInputQuery('')
    setIsProcessing(true)

    // Check if real AI IPC is available
    if (window.vuaMail?.aiStream && window.vuaMail?.getAiSettings) {
      try {
        const settings = await window.vuaMail.getAiSettings()
        const reqId = `mail_ai_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
        activeStreamIdRef.current = reqId

        let emailContext = ''
        if (selectedEmail) {
          emailContext = `\n\nBối cảnh email đang mở:\n- Người gửi: ${selectedEmail.senderName} <${selectedEmail.senderEmail}>\n- Tiêu đề: ${selectedEmail.subject}\n- Nội dung tóm tắt: ${selectedEmail.snippet}`
        }

        const systemPrompt = `Bạn là Genspark AI Mail Agent, trợ lý trí tuệ nhân tạo chuyên nghiệp của hệ sinh thái GenOffice Suite thuộc 360 CORP. Bạn hỗ trợ Sếp Châu Lê trong việc xử lý email, tóm tắt, soạn thảo phản hồi, trích xuất việc cần làm (To-Do), và sắp xếp lịch họp. Luôn xưng "em", gọi người dùng là "Sếp" hoặc "anh", trả lời bằng tiếng Việt chuyên nghiệp, ngắn gọn và thực dụng.${emailContext}`

        await window.vuaMail.aiStream({
          requestId: reqId,
          settings,
          system: systemPrompt,
          messages: [
            ...messages
              .filter((m) => m.id !== 'm_welcome')
              .map((m) => ({
                role: m.role,
                content: m.content,
              })),
            { role: 'user', content: query.trim() },
          ],
        })
      } catch (err: any) {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant') return prev
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content: `Lỗi kết nối AI: ${err.message || 'Không thể gọi AI Vendor'}`,
            },
          ]
        })
        setIsProcessing(false)
        activeStreamIdRef.current = null
      }
    } else {
      // Fallback
      setTimeout(() => {
        let responseContent = ''
        const q = query.toLowerCase()
        if (q.includes('tóm tắt') || q.includes('summary')) {
          responseContent = selectedEmail
            ? `Tóm tắt nội dung email "${selectedEmail.subject}":\n\n• Người gửi: ${selectedEmail.senderName} (${selectedEmail.senderEmail})\n• Nội dung chính: ${selectedEmail.snippet}\n• Hành động đề xuất: Cần xác nhận phản hồi và kiểm tra tệp đính kèm liên quan.`
            : 'Sếp vui lòng chọn một email từ danh sách để em phân tích và tóm tắt chi tiết.'
        } else {
          responseContent = `Dạ em đã nhận được yêu cầu: "${query}". Đang kết nối tới Genspark AI Gateway.`
        }
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.role !== 'assistant') return prev
          return [
            ...prev.slice(0, -1),
            { ...last, content: responseContent },
          ]
        })
        setIsProcessing(false)
      }, 500)
    }
  }

  return (
    <div
      className={`ai-dock ${isOpen ? 'open' : 'collapsed'}`}
      style={{ width: isOpen ? `${panelWidth}px` : '34px' }}
    >
      {/* Collapsed Rail Button */}
      {!isOpen && (
        <button
          type="button"
          className="ai-rail"
          onClick={onClose}
          title="Mở bảng trợ lý Genspark AI"
        >
          <GensparkMark size={20} />
          <span className="ai-rail-text">Genspark AI</span>
        </button>
      )}

      {/* Expanded AI Panel Dock */}
      {isOpen && (
        <div className="ai-dock-content">
          {/* Drag Resizer Left Edge */}
          <div
            className="ai-dock-resizer"
            onMouseDown={handleStartResize}
            title="Kéo để thay đổi độ rộng bảng AI"
          />

          {/* AI Panel Header */}
          <div className="ai-panel-header">
            <div className="ai-header-left">
              <GensparkMark size={18} />
              <span>Genspark AI</span>
            </div>

            <div className="ai-header-actions">
              <button
                type="button"
                className="ai-action-btn"
                onClick={() => setMessages([messages[0]])}
                title="Làm mới đoạn chat"
              >
                <IconRefresh size={13} />
              </button>
              <button
                type="button"
                className="ai-action-btn"
                onClick={onClose}
                title="Thu gọn bảng AI"
              >
                <IconX size={14} />
              </button>
            </div>
          </div>

          {/* Selected Email Context Tag */}
          {selectedEmail && (
            <div className="ai-context-banner">
              <span className="context-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <IconMail size={13} color="var(--mail-primary-blue, #0077cd)" />
              </span>
              <span className="context-subject">{selectedEmail.subject || '(Không có tiêu đề)'}</span>
              <span className="context-badge">Context</span>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="ai-messages-scroll">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`ai-message-bubble-wrapper ${m.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="ai-message-bubble">
                  {m.content}
                </div>
                <span className="ai-message-time">{m.timestamp}</span>
              </div>
            ))}

            {isProcessing && (
              <div className="ai-processing-state">
                <span className="ai-spinner-dot" />
                <span>Genspark AI đang phân tích và xử lý...</span>
              </div>
            )}
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="ai-chips-bar">
            <button
              type="button"
              className="ai-chip"
              onClick={() => handleSend('Tóm tắt email này cho anh')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <IconSparkles size={12} color="var(--mail-primary-blue, #0077cd)" />
              <span>Tóm tắt</span>
            </button>
            <button
              type="button"
              className="ai-chip"
              onClick={() => handleSend('Soạn thư trả lời đồng ý và cảm ơn')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <IconReply size={12} color="var(--mail-primary-blue, #0077cd)" />
              <span>Soạn trả lời</span>
            </button>
            <button
              type="button"
              className="ai-chip"
              onClick={() => handleSend('Trích xuất việc cần làm vào To-Do')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <IconCheckSquare size={12} color="var(--mail-brand-green, #00ce2c)" />
              <span>Tạo To-Do</span>
            </button>
          </div>

          {/* Chat Input Box */}
          <div className="ai-input-wrapper">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="ai-input-form"
            >
              <input
                type="text"
                placeholder="Hỏi Genspark AI..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isProcessing}
                className="ai-send-btn"
                title="Gửi câu hỏi"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <IconSend size={13} color="#ffffff" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
