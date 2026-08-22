import React, { useState } from 'react'
import type { EmailAccount } from '../../../../shared/types'
import {
  IconSettings,
  IconUsers,
  IconEdit,
  IconKeyboard,
  IconX,
  IconLock,
  IconMicrosoft,
  IconGoogle,
  IconGlobe,
  IconApple,
  IconYahoo,
  IconServer,
} from '../common/MailIcons'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  accounts: EmailAccount[]
  activeAccountId: string
  onAccountsUpdated: () => void
}

type SettingsTab = 'general' | 'accounts' | 'signatures' | 'shortcuts'
type AddAccountStep = 'input_email' | 'choose_provider' | 'manual_imap'

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  activeAccountId,
  onAccountsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('accounts')
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [addStep, setAddStep] = useState<AddAccountStep>('input_email')

  // New account form state
  const [provider, setProvider] = useState<'google' | 'microsoft' | 'custom_imap'>('custom_imap')
  const [accName, setAccName] = useState('')
  const [accEmail, setAccEmail] = useState('')
  const [accPassword, setAccPassword] = useState('')
  const [imapHost, setImapHost] = useState('imap.360.org.vn')
  const [imapPort, setImapPort] = useState(993)
  const [smtpHost, setSmtpHost] = useState('smtp.360.org.vn')
  const [smtpPort, setSmtpPort] = useState(587)
  const [isSaving, setIsSaving] = useState(false)
  const [authStatus, setAuthStatus] = useState<string | null>(null)
  const [signatureText, setSignatureText] = useState(
    '--\nTrân trọng,\nChâu Lê\n360 CORP | VuaOffice Suite\nEmail: chau.le@360.org.vn | Website: https://360.org.vn'
  )

  if (!isOpen) return null

  const handleStartOAuthLogin = async (
    selectedService: 'google' | 'microsoft' | '360' | 'icloud' | 'yahoo' | 'exchange' | 'auto',
    emailHintInput?: string
  ) => {
    setIsSaving(true)
    const emailToUse = emailHintInput || accEmail
    setAuthStatus(`Đang mở cửa sổ trình duyệt đăng nhập ${selectedService.toUpperCase()}...`)

    try {
      if (window.vuaMail) {
        const result = await window.vuaMail.startOAuthFlow(selectedService, emailToUse)
        if (result && result.success) {
          setAuthStatus('Xác thực và cấp quyền thành công!')
          onAccountsUpdated()
          setTimeout(() => {
            setIsAddingAccount(false)
            setAddStep('input_email')
            setIsSaving(false)
            setAuthStatus(null)
          }, 600)
        } else {
          setAuthStatus(result?.error || 'Xác thực không thành công')
          setIsSaving(false)
        }
      }
    } catch (err: any) {
      setAuthStatus(`Lỗi xác thực: ${err.message || 'Không thể đăng nhập'}`)
      setIsSaving(false)
    }
  }

  const handleCancelOAuth = async () => {
    if (window.vuaMail) {
      await window.vuaMail.cancelOAuthFlow()
    }
    setIsSaving(false)
    setAuthStatus(null)
  }

  const handleEmailContinue = () => {
    const raw = accEmail.trim().toLowerCase()
    if (!raw) return

    if (raw.endsWith('@gmail.com') || raw.endsWith('@googlemail.com')) {
      handleStartOAuthLogin('google', raw)
    } else if (
      raw.endsWith('@outlook.com') ||
      raw.endsWith('@hotmail.com') ||
      raw.endsWith('@live.com') ||
      raw.endsWith('@microsoft.com') ||
      raw.endsWith('@office365.com')
    ) {
      handleStartOAuthLogin('microsoft', raw)
    } else if (raw.endsWith('@icloud.com') || raw.endsWith('@me.com') || raw.endsWith('@mac.com')) {
      handleStartOAuthLogin('icloud', raw)
    } else if (raw.endsWith('@yahoo.com') || raw.endsWith('@ymail.com')) {
      handleStartOAuthLogin('yahoo', raw)
    } else if (raw.endsWith('@360.org.vn') || raw.endsWith('@vuahethong.com') || raw.endsWith('@vuaai.net')) {
      handleStartOAuthLogin('360', raw)
    } else {
      setAddStep('choose_provider')
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accEmail.trim() || !window.vuaMail) return
    setIsSaving(true)
    try {
      await window.vuaMail.addAccount({
        email: accEmail.trim(),
        name: accName.trim() || accEmail.split('@')[0],
        provider,
        imapHost: provider === 'custom_imap' ? imapHost : undefined,
        imapPort: provider === 'custom_imap' ? Number(imapPort) : undefined,
        smtpHost: provider === 'custom_imap' ? smtpHost : undefined,
        smtpPort: provider === 'custom_imap' ? Number(smtpPort) : undefined,
        password: accPassword,
      })
      setIsAddingAccount(false)
      setAddStep('input_email')
      setAccEmail('')
      setAccName('')
      setAccPassword('')
      onAccountsUpdated()
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveAccount = async (id: string) => {
    if (!window.vuaMail) return
    if (confirm('Sếp có chắc chắn muốn ngắt kết nối tài khoản email này?')) {
      await window.vuaMail.removeAccount(id)
      onAccountsUpdated()
    }
  }

  const handleSetPrimary = async (id: string) => {
    if (!window.vuaMail) return
    await window.vuaMail.setPrimaryAccount(id)
    onAccountsUpdated()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          width: '780px',
          height: '560px',
          backgroundColor: 'var(--surface, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          overflow: 'hidden',
          border: '1px solid var(--border, #e3e6ea)',
        }}
      >
        {/* Settings Left Navigation Sidebar */}
        <div
          style={{
            width: '210px',
            backgroundColor: 'var(--surface-subtle, #f6f7f9)',
            borderRight: '1px solid var(--border, #e3e6ea)',
            padding: '24px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary, #232425)', padding: '0 10px 16px 10px' }}>
            Cài đặt (Settings)
          </div>

          <button
            onClick={() => setActiveTab('general')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'general' ? 'var(--mail-primary-blue-soft, #e5f3fc)' : 'transparent',
              color: activeTab === 'general' ? 'var(--mail-primary-blue, #0077cd)' : 'var(--text-primary, #232425)',
              fontWeight: activeTab === 'general' ? 600 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <IconSettings size={15} color={activeTab === 'general' ? 'var(--mail-primary-blue, #0077cd)' : 'var(--text-secondary, #606366)'} />
            <span>Chung (General)</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'accounts' ? 'var(--mail-primary-blue-soft, #e5f3fc)' : 'transparent',
              color: activeTab === 'accounts' ? 'var(--mail-primary-blue, #0077cd)' : 'var(--text-primary, #232425)',
              fontWeight: activeTab === 'accounts' ? 600 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <IconUsers size={15} color={activeTab === 'accounts' ? 'var(--mail-primary-blue, #0077cd)' : 'var(--text-secondary, #606366)'} />
            <span>Tài khoản Mail</span>
          </button>

          <button
            onClick={() => setActiveTab('signatures')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'signatures' ? 'var(--mail-primary-blue-soft, #e5f3fc)' : 'transparent',
              color: activeTab === 'signatures' ? 'var(--mail-primary-blue, #0077cd)' : 'var(--text-primary, #232425)',
              fontWeight: activeTab === 'signatures' ? 600 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <IconEdit size={15} color={activeTab === 'signatures' ? 'var(--mail-primary-blue, #0077cd)' : 'var(--text-secondary, #606366)'} />
            <span>Chữ ký thư</span>
          </button>

          <button
            onClick={() => setActiveTab('shortcuts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'shortcuts' ? 'var(--mail-primary-blue-soft, #e5f3fc)' : 'transparent',
              color: activeTab === 'shortcuts' ? 'var(--mail-primary-blue, #0077cd)' : 'var(--text-primary, #232425)',
              fontWeight: activeTab === 'shortcuts' ? 600 : 400,
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <IconKeyboard size={15} color={activeTab === 'shortcuts' ? 'var(--mail-primary-blue, #0077cd)' : 'var(--text-secondary, #606366)'} />
            <span>Phím tắt</span>
          </button>
        </div>

        {/* Settings Right Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface, #ffffff)', overflow: 'hidden' }}>
          {/* Top Bar with Close Button */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border, #e3e6ea)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>
              {activeTab === 'general' && 'Cấu hình hệ thống chung'}
              {activeTab === 'accounts' && 'Quản lý Tài khoản Mail & Xác thực Outlook'}
              {activeTab === 'signatures' && 'Quản lý Chữ ký điện tử'}
              {activeTab === 'shortcuts' && 'Danh mục Phím tắt VuaOffice Mail'}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted, #878e96)',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconX size={16} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
            {/* TAB: ACCOUNTS */}
            {activeTab === 'accounts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary, #232425)' }}>
                      Danh sách tài khoản ({accounts.length})
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted, #878e96)' }}>
                      Tài khoản trên cùng là tài khoản mặc định gửi thư.
                    </div>
                  </div>

                  {!isAddingAccount && (
                    <button
                      onClick={() => {
                        setIsAddingAccount(true)
                        setAddStep('input_email')
                      }}
                      style={{
                        backgroundColor: '#0078d4',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      + Thêm tài khoản mới
                    </button>
                  )}
                </div>

                {/* Add Account Live Form */}
                {isAddingAccount && (
                  <div
                    style={{
                      backgroundColor: 'var(--surface-subtle, #f6f7f9)',
                      border: '1px solid var(--border, #e3e6ea)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--mail-primary-blue, #0077cd)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IconLock size={14} color="var(--mail-primary-blue, #0077cd)" />
                        <span>Thêm tài khoản & Xác thực an toàn (Outlook Account Setup)</span>
                      </div>

                      {addStep !== 'input_email' && (
                        <button
                          type="button"
                          onClick={() => setAddStep('input_email')}
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            border: '1px solid var(--border)',
                            borderRadius: '3px',
                            backgroundColor: 'var(--surface)',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          ← Quay lại
                        </button>
                      )}
                    </div>

                    {/* STEP 1: INPUT EMAIL */}
                    {addStep === 'input_email' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Nhập địa chỉ Email của bạn:
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="email"
                              placeholder="chau.le@outlook.com, name@gmail.com, ceo@360.org.vn..."
                              value={accEmail}
                              onChange={(e) => setAccEmail(e.target.value)}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: '4px',
                                border: '1px solid var(--border)',
                                fontSize: '12px',
                                outline: 'none',
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && accEmail.trim()) {
                                  handleEmailContinue()
                                }
                              }}
                            />
                            <button
                              type="button"
                              disabled={!accEmail.trim() || isSaving}
                              onClick={handleEmailContinue}
                              style={{
                                backgroundColor: 'var(--outlook-blue, #0078d4)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: accEmail.trim() ? 'pointer' : 'not-allowed',
                                opacity: accEmail.trim() && !isSaving ? 1 : 0.6,
                              }}
                            >
                              {isSaving ? 'Đang mở...' : 'Tiếp tục →'}
                            </button>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Tự động phân giải provider hoặc chọn thủ công.
                            </span>
                            <button
                              type="button"
                              onClick={() => setAddStep('choose_provider')}
                              style={{
                                border: 'none',
                                background: 'none',
                                color: 'var(--mail-primary-blue, #0077cd)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: 0,
                                textDecoration: 'underline',
                              }}
                            >
                              Chọn nhà cung cấp khác
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('microsoft')}
                            disabled={isSaving}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconMicrosoft size={24} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Microsoft Outlook</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Office 365 / Exchange</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('google')}
                            disabled={isSaving}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconGoogle size={24} />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>Google Workspace</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gmail / Workspace</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('360')}
                            disabled={isSaving}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconGlobe size={24} color="var(--mail-primary-blue, #0077cd)" />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>360 CORP SSO</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>360.org.vn Server</span>
                          </button>
                        </div>

                        {authStatus && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '4px', backgroundColor: 'var(--mail-primary-blue-soft, #e5f3fc)', color: 'var(--mail-primary-blue, #0077cd)', fontSize: '12px', fontWeight: 500 }}>
                            <span>⏳ {authStatus}</span>
                            {isSaving && (
                              <button
                                type="button"
                                onClick={handleCancelOAuth}
                                style={{
                                  border: '1px solid var(--mail-primary-blue, #0077cd)',
                                  background: '#fff',
                                  color: 'var(--mail-primary-blue, #0077cd)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Hủy / Thử lại
                              </button>
                            )}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (isSaving) handleCancelOAuth()
                              setIsAddingAccount(false)
                            }}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid var(--border)',
                              padding: '5px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: CHOOSE PROVIDER */}
                    {addStep === 'choose_provider' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          Chọn nhà cung cấp dịch vụ cho: <strong>{accEmail || 'Tài khoản mới'}</strong>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('microsoft', accEmail)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconMicrosoft size={24} />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>Microsoft 365</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('microsoft', accEmail)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconMicrosoft size={24} />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>Outlook.com</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('exchange', accEmail)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconServer size={24} color="var(--outlook-blue)" />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>Exchange</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('google', accEmail)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconGoogle size={24} />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>Google</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('icloud', accEmail)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconApple size={24} color="var(--text-primary)" />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>iCloud</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('yahoo', accEmail)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconYahoo size={24} color="#6001d2" />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>Yahoo Mail</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartOAuthLogin('360', accEmail)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconGlobe size={24} color="var(--mail-primary-blue, #0077cd)" />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>360 CORP</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAddStep('manual_imap')}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '12px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              cursor: 'pointer',
                            }}
                          >
                            <IconServer size={24} color="#10b981" />
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>IMAP / POP</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: MANUAL IMAP FORM */}
                    {addStep === 'manual_imap' && (
                      <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 500 }}>Email:</label>
                            <input
                              type="email"
                              required
                              value={accEmail}
                              onChange={(e) => setAccEmail(e.target.value)}
                              style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 500 }}>Tên hiển thị:</label>
                            <input
                              type="text"
                              required
                              value={accName}
                              onChange={(e) => setAccName(e.target.value)}
                              style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 500 }}>Mật khẩu ứng dụng:</label>
                            <input
                              type="password"
                              required
                              value={accPassword}
                              onChange={(e) => setAccPassword(e.target.value)}
                              style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: 500 }}>Giao thức:</label>
                            <select
                              value={provider}
                              onChange={(e: any) => setProvider(e.target.value)}
                              style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }}
                            >
                              <option value="custom_imap">Custom IMAP / SMTP</option>
                              <option value="microsoft">Microsoft Exchange</option>
                              <option value="google">Google Workspace</option>
                            </select>
                          </div>
                        </div>

                        {provider === 'custom_imap' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', gap: '6px' }}>
                            <div>
                              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>IMAP Host:</label>
                              <input type="text" value={imapHost} onChange={(e) => setImapHost(e.target.value)} style={{ width: '100%', padding: '4px 6px', fontSize: '10px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Port:</label>
                              <input type="number" value={imapPort} onChange={(e) => setImapPort(Number(e.target.value))} style={{ width: '100%', padding: '4px 6px', fontSize: '10px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SMTP Host:</label>
                              <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} style={{ width: '100%', padding: '4px 6px', fontSize: '10px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Port:</label>
                              <input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} style={{ width: '100%', padding: '4px 6px', fontSize: '10px', boxSizing: 'border-box' }} />
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                          <button type="button" onClick={() => setAddStep('choose_provider')} style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid var(--border)', borderRadius: '3px', cursor: 'pointer' }}>
                            Quay lại
                          </button>
                          <button type="submit" disabled={isSaving} style={{ backgroundColor: '#0078d4', color: '#fff', border: 'none', padding: '4px 14px', borderRadius: '3px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                            {isSaving ? 'Đang lưu...' : 'Lưu'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* List of Accounts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {accounts.map((acc) => {
                    const isPrimary = acc.isDefault || acc.id === activeAccountId
                    const initial = (acc.name || acc.email).charAt(0).toUpperCase()

                    return (
                      <div
                        key={acc.id}
                        style={{
                          border: '1px solid var(--border, #e3e6ea)',
                          borderRadius: '6px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: 'var(--surface, #ffffff)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--outlook-blue)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px',
                            }}
                          >
                            {initial}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                                {acc.name}
                              </span>
                              {isPrimary && (
                                <span
                                  style={{
                                    fontSize: '9px',
                                    fontWeight: 600,
                                    backgroundColor: 'var(--mail-primary-blue-soft, #e5f3fc)',
                                    color: 'var(--mail-primary-blue, #0077cd)',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                  }}
                                >
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {acc.email} • {acc.provider.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {!isPrimary && (
                            <button
                              onClick={() => handleSetPrimary(acc.id)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '3px',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--surface)',
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                            >
                              Đặt mặc định
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveAccount(acc.id)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '3px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--surface)',
                              color: '#ef4444',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB: GENERAL */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '14px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Hộp thư Đến có tiêu điểm (Focused Inbox)
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked />
                    <span>Tự động lọc thư quan trọng vào tab Ưu tiên</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: SIGNATURES */}
            {activeTab === 'signatures' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Chữ ký thư điện tử:</div>
                <textarea
                  rows={6}
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => alert('Đã lưu chữ ký!')}
                    style={{ backgroundColor: '#0078d4', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Lưu chữ ký
                  </button>
                </div>
              </div>
            )}

            {/* TAB: SHORTCUTS */}
            {activeTab === 'shortcuts' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                  <span>Soạn thư</span>
                  <kbd>⌘ N</kbd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                  <span>Gửi thư</span>
                  <kbd>⌘ Enter</kbd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                  <span>Trả lời</span>
                  <kbd>⌘ R</kbd>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                  <span>Chuyển tiếp</span>
                  <kbd>⌘ F</kbd>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
