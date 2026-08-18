import React, { useEffect, useState } from 'react'
import { AppRail, AppRailTab } from './components/sidebar/AppRail'
import { FolderTree } from './components/sidebar/FolderTree'
import { MailRibbon } from './components/ribbon/MailRibbon'
import { MailList } from './components/list/MailList'
import { ReadingPane } from './components/detail/ReadingPane'
import { ComposeModal } from './components/compose/ComposeModal'
import type { EmailAccount, EmailBody, EmailMessage, MailFolder } from '../../shared/types'
import './styles/mail-theme.css'

export const App: React.FC = () => {
  const [activeRailTab, setActiveRailTab] = useState<AppRailTab>('mail')
  const [accounts, setAccounts] = useState<EmailAccount[]>([])
  const [activeAccount, setActiveAccount] = useState<EmailAccount | null>(null)
  const [folders, setFolders] = useState<MailFolder[]>([])
  const [activeFolderId, setActiveFolderId] = useState<string>('f_inbox')
  const [categoryTab, setCategoryTab] = useState<'focused' | 'other'>('focused')
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [activeBody, setActiveBody] = useState<EmailBody | null>(null)
  const [isLoadingBody, setIsLoadingBody] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Load initial accounts & folders
  useEffect(() => {
    async function loadInitial() {
      if (!window.vuaMail) return
      const accList = await window.vuaMail.getAccounts()
      setAccounts(accList)
      if (accList.length > 0) {
        const primary = accList[0]
        setActiveAccount(primary)
        const fList = await window.vuaMail.getFolders(primary.id)
        setFolders(fList)
      }
    }
    loadInitial()
  }, [])

  // Load emails when folder or category changes
  useEffect(() => {
    async function loadEmails() {
      if (!window.vuaMail) return
      const list = await window.vuaMail.getEmails(activeFolderId, categoryTab)
      setEmails(list)
      if (list.length > 0) {
        setSelectedEmailId(list[0].id)
      } else {
        setSelectedEmailId(null)
        setActiveBody(null)
      }
    }
    loadEmails()
  }, [activeFolderId, categoryTab])

  // Load email body when selection changes
  useEffect(() => {
    async function loadBody() {
      if (!window.vuaMail || !selectedEmailId) {
        setActiveBody(null)
        setAiSummary(null)
        return
      }
      setIsLoadingBody(true)
      setAiSummary(null)
      const body = await window.vuaMail.getEmailBody(selectedEmailId)
      setActiveBody(body)
      setIsLoadingBody(false)
    }
    loadBody()
  }, [selectedEmailId])

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null

  const filteredEmails = emails.filter((e) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      e.subject.toLowerCase().includes(q) ||
      e.senderName.toLowerCase().includes(q) ||
      e.snippet.toLowerCase().includes(q)
    )
  })

  const handleDelete = async () => {
    if (!window.vuaMail || !selectedEmailId) return
    await window.vuaMail.deleteEmail(selectedEmailId)
    setEmails((prev) => prev.filter((e) => e.id !== selectedEmailId))
    setSelectedEmailId(null)
  }

  const handleArchive = async () => {
    if (!window.vuaMail || !selectedEmailId) return
    await window.vuaMail.archiveEmail(selectedEmailId)
    setEmails((prev) => prev.filter((e) => e.id !== selectedEmailId))
    setSelectedEmailId(null)
  }

  const handleTriggerAiSummary = () => {
    if (!selectedEmail) return
    setAiSummary(
      `📌 Tóm tắt nội dung chính:\n• Email thông báo tiến độ cập nhật và vận hành của hệ thống VuaMail.\n• Đã kết nối thành công SQLite Engine và giao diện Fluent UI Outlook 365.\n• Đề xuất Sếp kiểm tra lại và duyệt release.`
    )
  }

  const handleSendDraft = async (draft: { to: string[]; subject: string; bodyHtml: string }) => {
    if (!window.vuaMail || !activeAccount) return
    await window.vuaMail.sendEmail({
      accountId: activeAccount.id,
      to: draft.to,
      subject: draft.subject,
      bodyHtml: draft.bodyHtml,
    })
  }

  return (
    <div className="vuamail-app">
      {/* Outlook Top Header */}
      <div className="vuamail-header">
        <div className="vuamail-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span>VuaOffice Mail</span>
        </div>

        <div className="vuamail-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search email, contacts, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ fontSize: '13px', fontWeight: 500 }}>{activeAccount?.email || 'chau.le@360.org.vn'}</div>
      </div>

      {/* Top Ribbon Toolbar */}
      <MailRibbon
        onNewEmail={() => setIsComposeOpen(true)}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onReply={() => setIsComposeOpen(true)}
        onReplyAll={() => setIsComposeOpen(true)}
        onForward={() => setIsComposeOpen(true)}
        onAiAssist={handleTriggerAiSummary}
        hasSelectedEmail={Boolean(selectedEmail)}
      />

      {/* 3-Column Outlook Main View */}
      <div className="vuamail-body">
        <AppRail activeTab={activeRailTab} onTabChange={setActiveRailTab} />

        <FolderTree
          folders={folders}
          activeFolderId={activeFolderId}
          onSelectFolder={setActiveFolderId}
          accountEmail={activeAccount?.email || ''}
        />

        <MailList
          emails={filteredEmails}
          selectedEmailId={selectedEmailId}
          onSelectEmail={setSelectedEmailId}
          categoryTab={categoryTab}
          onCategoryChange={setCategoryTab}
        />

        <ReadingPane
          email={selectedEmail}
          body={activeBody}
          aiSummary={aiSummary}
          isLoadingBody={isLoadingBody}
          onTriggerAiSummary={handleTriggerAiSummary}
        />
      </div>

      {/* Compose Email Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendDraft}
      />
    </div>
  )
}
