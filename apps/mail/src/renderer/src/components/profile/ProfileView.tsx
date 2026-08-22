import React, { useState } from 'react'
import type { EmailAccount } from '../../../../shared/types'
import {
  IconBrain,
  IconUsers,
  IconSettings,
  IconEdit,
  IconKeyboard,
  IconLock,
  IconMicrosoft,
  IconGoogle,
  IconGlobe,
  IconApple,
  IconYahoo,
  IconServer,
  IconBox,
} from '../common/MailIcons'

interface ProfileViewProps {
  accounts: EmailAccount[]
  activeAccountId: string
  onAccountsUpdated: () => void
  onSelectAccount: (accountId: string) => void
  onOpenImportExport?: () => void
  onClose?: () => void
}

type ProfileTab = 'accounts' | 'general' | 'signatures' | 'shortcuts'
type AddAccountStep = 'input_email' | 'choose_provider' | 'manual_imap'

export const ProfileView: React.FC<ProfileViewProps> = ({
  accounts,
  activeAccountId,
  onAccountsUpdated,
  onSelectAccount,
  onOpenImportExport,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('accounts')
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [addStep, setAddStep] = useState<AddAccountStep>('input_email')

  // Manual account form state
  const [provider, setProvider] = useState<'google' | 'microsoft' | 'custom_imap'>('custom_imap')
  const [accName, setAccName] = useState('')
  const [accEmail, setAccEmail] = useState('')
  const [accPassword, setAccPassword] = useState('')
  const [imapHost, setImapHost] = useState('imap.360.org.vn')
  const [imapPort, setImapPort] = useState(993)
  const [smtpHost, setSmtpHost] = useState('smtp.360.org.vn')
  const [smtpPort, setSmtpPort] = useState(587)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null)

  const [signatureText, setSignatureText] = useState(
    '--\nTrân trọng,\nChâu Lê\n360 CORP | VuaOffice Suite\nEmail: chau.le@360.org.vn | Website: https://360.org.vn'
  )

  // Trigger OAuth 2.0 / SSO Login Flow
  const handleStartOAuthLogin = async (
    selectedService: 'google' | 'microsoft' | 'microsoft_personal' | '360' | 'icloud' | 'yahoo' | 'exchange' | 'auto',
    emailHintInput?: string
  ) => {
    setIsAuthenticating(true)
    const emailToUse = emailHintInput || accEmail
    setAuthStatusMessage(`Đang mở cửa sổ đăng nhập an toàn với ${selectedService.toUpperCase()}...`)

    try {
      if (window.vuaMail) {
        const result = await window.vuaMail.startOAuthFlow(selectedService, emailToUse)
        if (result && result.success) {
          setAuthStatusMessage('Đăng nhập và cấp quyền thành công!')
          onAccountsUpdated()
          if (result.account) {
            onSelectAccount(result.account.id)
          }
          setTimeout(() => {
            setIsAddingAccount(false)
            setAddStep('input_email')
            setIsAuthenticating(false)
            setAuthStatusMessage(null)
          }, 600)
        } else {
          setAuthStatusMessage(result?.error || 'Xác thực không thành công')
          setIsAuthenticating(false)
        }
      }
    } catch (err: any) {
      setAuthStatusMessage(`Lỗi xác thực: ${err.message || 'Không thể hoàn tất đăng nhập'}`)
      setIsAuthenticating(false)
    }
  }

  const handleCancelOAuth = async () => {
    if (window.vuaMail) {
      await window.vuaMail.cancelOAuthFlow()
    }
    setIsAuthenticating(false)
    setAuthStatusMessage(null)
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
      // Domain tùy chỉnh / doanh nghiệp -> hiển thị bảng chọn Provider chuẩn Outlook
      setAddStep('choose_provider')
    }
  }

  const handleCreateAccountManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accEmail.trim() || !window.vuaMail) return
    setIsAuthenticating(true)
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
      setIsAuthenticating(false)
    }
  }

  const handleRemoveAccount = async (id: string) => {
    if (!window.vuaMail) return
    if (confirm('Sếp có chắc chắn muốn đăng xuất và ngắt kết nối tài khoản này?')) {
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
    <div className="brain-container">
      <div className="brain-scroll-area">
        {/* Header Hero Section */}
        <div className="brain-header">
          <div className="brain-header-main">
            <h1 className="brain-title">Hồ sơ cá nhân & Cài đặt (Profile & Settings)</h1>
            <div className="brain-subtitle">
              Quản lý tài khoản, kết nối xác thực OAuth, chữ ký thư và cấu hình hệ thống VuaOffice Mail
            </div>
          </div>
          <div className="brain-badge-group">
            <span className="brain-badge highlight">{accounts.length} tài khoản kết nối</span>
            <span className="brain-badge">360 CORP ID</span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Đóng
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="brain-tabs-bar">
          <button
            className={`brain-tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('accounts')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconUsers size={14} color={activeTab === 'accounts' ? 'var(--mail-primary-blue, #0077cd)' : 'currentColor'} />
            <span>Tài khoản & Xác thực (OAuth / IMAP)</span>
          </button>
          <button
            className={`brain-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconSettings size={14} color={activeTab === 'general' ? 'var(--mail-primary-blue, #0077cd)' : 'currentColor'} />
            <span>Cấu hình chung (General)</span>
          </button>
          <button
            className={`brain-tab-btn ${activeTab === 'signatures' ? 'active' : ''}`}
            onClick={() => setActiveTab('signatures')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconEdit size={14} color={activeTab === 'signatures' ? 'var(--mail-primary-blue, #0077cd)' : 'currentColor'} />
            <span>Chữ ký thư</span>
          </button>
          <button
            className={`brain-tab-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconKeyboard size={14} color={activeTab === 'shortcuts' ? 'var(--mail-primary-blue, #0077cd)' : 'currentColor'} />
            <span>Phím tắt</span>
          </button>
        </div>

        {/* TAB 2: ACCOUNTS & AUTH */}
        {activeTab === 'accounts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Hộp thư & Tài khoản đã đăng nhập ({accounts.length})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Hỗ trợ đăng nhập trực tiếp qua Microsoft 365, Outlook.com, Google Workspace, Exchange, iCloud, Yahoo hoặc IMAP/POP.
                </div>
              </div>

              {!isAddingAccount && (
                <button
                  onClick={() => {
                    setIsAddingAccount(true)
                    setAddStep('input_email')
                  }}
                  style={{
                    backgroundColor: 'var(--outlook-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>+</span>
                  <span>Đăng nhập tài khoản mới</span>
                </button>
              )}
            </div>

            {/* Login / Auth Modal Form */}
            {isAddingAccount && (
              <div
                style={{
                  backgroundColor: 'var(--surface-subtle, #f8fafc)',
                  border: '1px solid var(--border, #e2e8f0)',
                  borderRadius: '10px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mail-primary-blue, #0077cd)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconLock size={15} color="var(--mail-primary-blue, #0077cd)" />
                    <span>Thêm tài khoản & Xác thực an toàn (Outlook Account Setup)</span>
                  </div>

                  {addStep !== 'input_email' && (
                    <button
                      type="button"
                      onClick={() => setAddStep('input_email')}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--surface)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      ← Quay lại nhập Email
                    </button>
                  )}
                </div>

                {/* STEP 1: EMAIL INPUT & AUTO DISCOVERY */}
                {addStep === 'input_email' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Nhập địa chỉ Email của bạn:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="email"
                          placeholder="name@company.com, chau.le@outlook.com, ceo@360.org.vn..."
                          value={accEmail}
                          onChange={(e) => setAccEmail(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '9px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            fontSize: '13px',
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
                          disabled={!accEmail.trim() || isAuthenticating}
                          onClick={handleEmailContinue}
                          style={{
                            backgroundColor: 'var(--outlook-blue, #0078d4)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '9px 20px',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: accEmail.trim() ? 'pointer' : 'not-allowed',
                            opacity: accEmail.trim() && !isAuthenticating ? 1 : 0.6,
                          }}
                        >
                          {isAuthenticating ? 'Đang mở...' : 'Tiếp tục / Continue →'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Hệ thống tự động phát hiện Microsoft 365, Google Workspace, Exchange hoặc 360 CORP SSO.
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
                          Chọn nhà cung cấp thủ công (Advanced)
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Hoặc đăng nhập nhanh 1-click</span>
                      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {/* Microsoft 365 */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('microsoft')}
                        disabled={isAuthenticating}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid var(--border, #e2e8f0)',
                          backgroundColor: 'var(--surface, #ffffff)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconMicrosoft size={28} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Microsoft 365 / Outlook</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hotmail / Live / Office 365</span>
                      </button>

                      {/* Google Workspace */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('google')}
                        disabled={isAuthenticating}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid var(--border, #e2e8f0)',
                          backgroundColor: 'var(--surface, #ffffff)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconGoogle size={28} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Google Workspace</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Gmail / Corporate G-Suite</span>
                      </button>

                      {/* 360 CORP SSO */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('360')}
                        disabled={isAuthenticating}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid var(--border, #e2e8f0)',
                          backgroundColor: 'var(--surface, #ffffff)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconGlobe size={28} color="var(--mail-primary-blue, #0077cd)" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>360 CORP SSO</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>360.org.vn Cloud ERP</span>
                      </button>
                    </div>

                    {authStatusMessage && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '6px', backgroundColor: 'var(--outlook-blue-soft)', color: 'var(--outlook-blue)', fontSize: '12px', fontWeight: 500 }}>
                        <span>⏳ {authStatusMessage}</span>
                        {isAuthenticating && (
                          <button
                            type="button"
                            onClick={handleCancelOAuth}
                            style={{
                              border: '1px solid var(--outlook-blue)',
                              background: '#fff',
                              color: 'var(--outlook-blue)',
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          if (isAuthenticating) handleCancelOAuth()
                          setIsAddingAccount(false)
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid var(--border)',
                          padding: '6px 14px',
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

                {/* STEP 2: PROVIDER SELECTION MODAL (OUTLOOK STANDARD) */}
                {addStep === 'choose_provider' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Chọn loại tài khoản hoặc nhà cung cấp dịch vụ cho địa chỉ: <strong>{accEmail || 'Tài khoản mới'}</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                      {/* 1. Microsoft 365 */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('microsoft', accEmail)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconMicrosoft size={26} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Microsoft 365</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Doanh nghiệp / Work</span>
                      </button>

                      {/* 2. Outlook.com */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('microsoft_personal', accEmail)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconMicrosoft size={26} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Outlook.com</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cá nhân / Hotmail / Live</span>
                      </button>

                      {/* 3. Exchange */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('exchange', accEmail)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconServer size={26} color="var(--outlook-blue)" />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Exchange Server</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>On-Prem / Hosted</span>
                      </button>

                      {/* 4. Google */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('google', accEmail)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconGoogle size={26} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Google Workspace</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gmail / G-Suite</span>
                      </button>

                      {/* 5. Apple iCloud */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('icloud', accEmail)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconApple size={26} color="var(--text-primary)" />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>iCloud Mail</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>@icloud.com</span>
                      </button>

                      {/* 6. Yahoo Mail */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('yahoo', accEmail)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconYahoo size={26} color="#6001d2" />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Yahoo! Mail</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Yahoo / AOL</span>
                      </button>

                      {/* 7. 360 CORP SSO */}
                      <button
                        type="button"
                        onClick={() => handleStartOAuthLogin('360', accEmail)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconGlobe size={26} color="var(--mail-primary-blue, #0077cd)" />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>360 CORP SSO</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>360.org.vn</span>
                      </button>

                      {/* 8. IMAP / POP Custom */}
                      <button
                        type="button"
                        onClick={() => setAddStep('manual_imap')}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          cursor: 'pointer',
                        }}
                      >
                        <IconServer size={26} color="#10b981" />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>IMAP / POP</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cấu hình máy chủ</span>
                      </button>
                    </div>

                    {authStatusMessage && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '6px', backgroundColor: 'var(--outlook-blue-soft)', color: 'var(--outlook-blue)', fontSize: '12px', fontWeight: 500 }}>
                        <span>⏳ {authStatusMessage}</span>
                        {isAuthenticating && (
                          <button
                            type="button"
                            onClick={handleCancelOAuth}
                            style={{
                              border: '1px solid var(--outlook-blue)',
                              background: '#fff',
                              color: 'var(--outlook-blue)',
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
                  </div>
                )}

                {/* STEP 3: MANUAL IMAP / POP CONFIG FORM */}
                {addStep === 'manual_imap' && (
                  <form onSubmit={handleCreateAccountManual} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                          Địa chỉ Email:
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="admin@360.org.vn"
                          value={accEmail}
                          onChange={(e) => setAccEmail(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                          Tên hiển thị:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Châu Lê"
                          value={accName}
                          onChange={(e) => setAccName(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                          Mật khẩu ứng dụng (App Password):
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={accPassword}
                          onChange={(e) => setAccPassword(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                          Loại giao thức:
                        </label>
                        <select
                          value={provider}
                          onChange={(e: any) => setProvider(e.target.value)}
                          style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px', boxSizing: 'border-box' }}
                        >
                          <option value="custom_imap">Custom IMAP / SMTP (SSL/TLS)</option>
                          <option value="microsoft">Microsoft Exchange</option>
                          <option value="google">Google Workspace</option>
                        </select>
                      </div>
                    </div>

                    {provider === 'custom_imap' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>IMAP Host:</label>
                          <input type="text" value={imapHost} onChange={(e) => setImapHost(e.target.value)} style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Port:</label>
                          <input type="number" value={imapPort} onChange={(e) => setImapPort(Number(e.target.value))} style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SMTP Host:</label>
                          <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Port:</label>
                          <input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} style={{ width: '100%', padding: '5px 8px', fontSize: '11px', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                      <button type="button" onClick={() => setAddStep('choose_provider')} style={{ padding: '6px 12px', fontSize: '12px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>
                        Quay lại
                      </button>
                      <button type="submit" disabled={isAuthenticating} style={{ backgroundColor: 'var(--outlook-blue)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                        {isAuthenticating ? 'Đang xác thực...' : 'Lưu tài khoản'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* List connected accounts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {accounts.map((acc) => {
                const isPrimary = acc.isDefault || acc.id === activeAccountId
                const initial = (acc.name || acc.email).charAt(0).toUpperCase()

                return (
                  <div
                    key={acc.id}
                    style={{
                      border: '1px solid var(--border, #e3e6ea)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--surface, #ffffff)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--outlook-blue)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      >
                        {initial}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                            {acc.name}
                          </span>
                          {isPrimary && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                backgroundColor: 'var(--outlook-blue-soft)',
                                color: 'var(--outlook-blue)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              Hộp thư chính
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {acc.email} • {acc.provider.toUpperCase()} • Đang đồng bộ tự động
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(acc.id)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '4px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--surface)',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Đặt làm mặc định
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveAccount(acc.id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface)',
                          color: '#ef4444',
                          fontSize: '11px',
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GENERAL SETTINGS */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="brain-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Hộp thư Đến có tiêu điểm (Focused & Other Inbox)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Tự động phân loại thư quan trọng vào mục Ưu tiên (Focused)
                </span>
                <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
            </div>

            <div className="brain-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Sao lưu & Nhập / Xuất dữ liệu hộp thư
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    Nhập/Xuất tệp Outlook PST và EML Archive
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Xuất toàn bộ thư mục thư ra file .pst hoặc nhập dữ liệu thư từ Outlook và Thunderbird.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenImportExport}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <IconBox size={14} color="var(--outlook-blue)" />
                  <span>Mở trình hướng dẫn Import/Export</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SIGNATURES */}
        {activeTab === 'signatures' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="brain-card" style={{ padding: '18px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Chữ ký email mặc định (Signature)
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Chữ ký này sẽ được tự động đính kèm vào cuối mỗi thư soạn mới hoặc thư trả lời.
              </div>
              <textarea
                rows={5}
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => alert('Đã lưu chữ ký email!')}
                  style={{
                    backgroundColor: 'var(--outlook-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Lưu chữ ký
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SHORTCUTS */}
        {activeTab === 'shortcuts' && (
          <div className="brain-card" style={{ padding: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Danh sách phím tắt thông dụng (Outlook 365 Keyboard Shortcuts)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px' }}>Soạn thư mới (New Mail)</span>
                <kbd style={{ padding: '2px 6px', backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '11px' }}>⌘ N / Ctrl+N</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px' }}>Gửi thư (Send Mail)</span>
                <kbd style={{ padding: '2px 6px', backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '11px' }}>⌘ Enter / Ctrl+Enter</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px' }}>Trả lời (Reply)</span>
                <kbd style={{ padding: '2px 6px', backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '11px' }}>⌘ R / Ctrl+R</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px' }}>Chuyển tiếp (Forward)</span>
                <kbd style={{ padding: '2px 6px', backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '11px' }}>⌘ F / Ctrl+F</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px' }}>Xóa thư (Delete)</span>
                <kbd style={{ padding: '2px 6px', backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '11px' }}>Delete / Backspace</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px' }}>Lưu trữ thư (Archive)</span>
                <kbd style={{ padding: '2px 6px', backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border)', borderRadius: '3px', fontSize: '11px' }}>Backspace / E</kbd>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
