import { useState } from 'react'
import { useI18n } from './locale'

const LOCAL_STRINGS: Record<string, Record<string, string>> = {
  zh: {
    aboutTitle: '关于 VuaOffice',
    appName: 'VuaOffice Suite',
    copyright: '© 2026 360 CORP & Mainfunc, Inc. 保留所有权利。',
    licenseTitle: '开源许可与致谢 (Apache 2.0)',
    licenseNotice: '本软件基于 GenOffice 开源项目构建，并遵循 Apache License 2.0 协议。',
    thirdPartyNotice: '查看第三方开源组件与著作权声明',
    close: '关闭',
  },
  'zh-TW': {
    aboutTitle: '關於 VuaOffice',
    appName: 'VuaOffice Suite',
    copyright: '© 2026 360 CORP & Mainfunc, Inc. 保留所有權利。',
    licenseTitle: '開源許可與致謝 (Apache 2.0)',
    licenseNotice: '本軟體基於 GenOffice 開源項目構建，並遵循 Apache License 2.0 協議。',
    thirdPartyNotice: '檢視第三方開源組件與著作權聲明',
    close: '關閉',
  },
  vi: {
    aboutTitle: 'Về VuaOffice',
    appName: 'Bộ ứng dụng văn phòng VuaOffice',
    copyright: '© 2026 360 CORP & Mainfunc, Inc. Bảo lưu mọi quyền.',
    licenseTitle: 'Giấy phép mã nguồn mở & Ghi nhận (Apache 2.0)',
    licenseNotice: 'VuaOffice được phát triển dựa trên dự án mã nguồn mở GenOffice theo Giấy phép Apache License 2.0.',
    thirdPartyNotice: 'Xem danh sách thư viện mã nguồn mở & Bản quyền bên thứ ba',
    close: 'Đóng',
  },
  en: {
    aboutTitle: 'About VuaOffice',
    appName: 'VuaOffice Suite',
    copyright: '© 2026 360 CORP & Mainfunc, Inc. All rights reserved.',
    licenseTitle: 'Open Source License & Attribution (Apache 2.0)',
    licenseNotice: 'VuaOffice is built on the open-source GenOffice project under the Apache License, Version 2.0.',
    thirdPartyNotice: 'View Third-Party Open Source Components & Notices',
    close: 'Close',
  },
}

interface AboutModalProps {
  appVersion: string
  onClose: () => void
}

export function AboutModal({ appVersion, onClose }: AboutModalProps) {
  const { lang } = useI18n()
  const loc = LOCAL_STRINGS[lang] || LOCAL_STRINGS.en
  const [showFullNotice, setShowFullNotice] = useState(false)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal about-modal"
        role="dialog"
        aria-modal="true"
        aria-label={loc.aboutTitle}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', width: '90%' }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>{loc.aboutTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              color: 'var(--text-muted)',
              lineHeight: 1,
              padding: 0,
            }}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="about-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text)' }}>
          <div>
            <strong>{loc.appName}</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>
              Version {appVersion || '0.6.0'}
            </div>
          </div>

          <div style={{ color: 'var(--text-secondary)' }}>
            {loc.copyright}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{loc.licenseTitle}</div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.5 }}>
              {loc.licenseNotice}
            </p>
          </div>

          <div style={{ background: 'var(--surface-hover)', padding: '10px 12px', borderRadius: '6px', fontSize: '12px', lineHeight: 1.4 }}>
            <div><strong>Attribution Notice:</strong></div>
            <div>Original Work: Copyright 2026 Mainfunc, Inc. (GenOffice)</div>
            <div>Derivative Work & Customizations: Copyright 2026 360 CORP (VuaOffice)</div>
          </div>

          <div style={{ marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setShowFullNotice(!showFullNotice)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                padding: 0,
                fontSize: '12px',
                textDecoration: 'underline',
              }}
            >
              {loc.thirdPartyNotice}
            </button>
          </div>

          {showFullNotice && (
            <div
              style={{
                maxHeight: '120px',
                overflowY: 'auto',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '11px',
                fontFamily: 'monospace',
                color: 'var(--text-muted)',
              }}
            >
              Licensed under the Apache License, Version 2.0 (the "License");
              you may not use this file except in compliance with the License.
              You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
              <br /><br />
              Third-party dependency notices and license text files are bundled in the application installation package under Resources/THIRD-PARTY-NOTICES.txt and Resources/LICENSES.chromium.html.
            </div>
          )}

          <div className="modal-buttons" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              {loc.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
