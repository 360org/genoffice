import React from 'react'
import {
  IconBrain,
  IconMail,
  IconCalendar,
  IconUsers,
  IconCheckSquare,
} from '../common/MailIcons'

export type AppRailTab = 'brain' | 'mail' | 'calendar' | 'people' | 'todo'

interface AppRailProps {
  activeTab: AppRailTab
  onTabChange: (tab: AppRailTab) => void
}

export const AppRail: React.FC<AppRailProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="mail-apprail">
      {/* 1. Email Brain */}
      <button
        type="button"
        className={`apprail-btn ${activeTab === 'brain' ? 'active' : ''}`}
        title="Trí tuệ nhân tạo (Email Brain)"
        onClick={() => onTabChange('brain')}
      >
        <IconBrain size={20} />
      </button>

      {/* 2. Mail (Inbox) */}
      <button
        type="button"
        className={`apprail-btn ${activeTab === 'mail' ? 'active' : ''}`}
        title="Hộp thư (Mail)"
        onClick={() => onTabChange('mail')}
      >
        <IconMail size={20} />
      </button>

      {/* 3. Calendar */}
      <button
        type="button"
        className={`apprail-btn ${activeTab === 'calendar' ? 'active' : ''}`}
        title="Lịch biểu (Calendar)"
        onClick={() => onTabChange('calendar')}
      >
        <IconCalendar size={20} />
      </button>

      {/* 4. People */}
      <button
        type="button"
        className={`apprail-btn ${activeTab === 'people' ? 'active' : ''}`}
        title="Danh bạ (People)"
        onClick={() => onTabChange('people')}
      >
        <IconUsers size={20} />
      </button>

      {/* 5. To-Do */}
      <button
        type="button"
        className={`apprail-btn ${activeTab === 'todo' ? 'active' : ''}`}
        title="Việc cần làm (To-Do)"
        onClick={() => onTabChange('todo')}
      >
        <IconCheckSquare size={20} />
      </button>
    </div>
  )
}

