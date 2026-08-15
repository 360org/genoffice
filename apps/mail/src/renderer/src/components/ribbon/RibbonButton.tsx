import React from 'react'

interface RibbonButtonProps {
  icon?: React.ReactNode
  label: string
  onClick?: () => void
  primary?: boolean
  disabled?: boolean
}

export const RibbonButton: React.FC<RibbonButtonProps> = ({
  icon,
  label,
  onClick,
  primary = false,
  disabled = false,
}) => {
  return (
    <button
      className={`ribbon-btn ${primary ? 'primary' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
