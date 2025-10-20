'use client'

import { motion } from 'motion/react'
import React from 'react'

/**
 * IconPack Component
 *
 * A standardized icon library with consistent hover animations for the entire application.
 * All icons use the same hover effect: scale-110 with transform transition.
 *
 * Features:
 * - Consistent hover animation (scale-110) across all icons
 * - Support for framer-motion animations
 * - Multiple size options (small: 20px, default: 24px, large: 32px)
 * - Disabled state support
 * - CRUD operations: Add, Edit, Delete, Save, Cancel
 * - Interactive elements: Checkboxes, Menu
 *
 * @example
 * ```tsx
 * <IconPack.Add onClick={handleAdd} size="default" />
 * <IconPack.Edit onClick={handleEdit} disabled={false} />
 * <IconPack.Delete onClick={handleDelete} size="large" />
 * <IconPack.Save onClick={handleSave} disabled={isSaving} />
 * ```
 */

interface IconProps extends Omit<React.ComponentProps<typeof motion.svg>, 'onClick'> {
  size?: 'small' | 'default' | 'large'
  disabled?: boolean
  onClick?: () => void
}

const sizes = {
  small: 20,
  default: 24,
  large: 32
}

// Base icon wrapper with consistent hover animation
const IconWrapper = ({
  size = 'default',
  disabled = false,
  onClick,
  children,
  className = '',
  ...props
}: IconProps & { children: React.ReactNode }) => {
  const dimension = sizes[size]

  return (
    <motion.svg
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={disabled ? undefined : onClick}
      className={`cursor-pointer hover:scale-110 transition-transform ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      whileHover={disabled ? {} : { scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.svg>
  )
}

// Add/Plus Icon - Circle with plus sign
const Add = (props: IconProps) => (
  <IconWrapper {...props}>
    <path
      opacity="0.5"
      d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      fill="#1C274C"
    />
    <path
      d="M12.75 9C12.75 8.58579 12.4142 8.25 12 8.25C11.5858 8.25 11.25 8.58579 11.25 9L11.25 11.25H9C8.58579 11.25 8.25 11.5858 8.25 12C8.25 12.4142 8.58579 12.75 9 12.75H11.25V15C11.25 15.4142 11.5858 15.75 12 15.75C12.4142 15.75 12.75 15.4142 12.75 15L12.75 12.75H15C15.4142 12.75 15.75 12.4142 15.75 12C15.75 11.5858 15.4142 11.25 15 11.25H12.75V9Z"
      fill="#1C274C"
    />
  </IconWrapper>
)

// Edit Icon - Pencil
const Edit = (props: IconProps) => (
  <IconWrapper {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      stroke="currentColor"
    />
  </IconWrapper>
)

// Delete Icon - Trash can
const Delete = (props: IconProps) => (
  <IconWrapper {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      stroke="currentColor"
    />
  </IconWrapper>
)

// Save/Check Icon - Circle with checkmark
const Save = (props: IconProps) => (
  <IconWrapper {...props}>
    <path
      opacity="0.5"
      d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      fill="#1C274C"
    />
    <path
      d="M16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z"
      fill="#1C274C"
    />
  </IconWrapper>
)

// Cancel/Close Icon - Circle with X
const Cancel = (props: IconProps) => (
  <IconWrapper {...props}>
    <path
      opacity="0.5"
      d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      fill="#1C274C"
    />
    <path
      d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5"
      stroke="#1C274C"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </IconWrapper>
)

// Menu Icon - Three dots in circle
const Menu = (props: IconProps) => (
  <IconWrapper {...props}>
    <path
      opacity="0.5"
      d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      fill="#1C274C"
    />
    <path
      d="M8.5 12C8.5 11.4477 8.94772 11 9.5 11C10.0523 11 10.5 11.4477 10.5 12C10.5 12.5523 10.0523 13 9.5 13C8.94772 13 8.5 12.5523 8.5 12Z"
      fill="#1C274C"
    />
    <path
      d="M11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12Z"
      fill="#1C274C"
    />
    <path
      d="M13.5 12C13.5 11.4477 13.9477 11 14.5 11C15.0523 11 15.5 11.4477 15.5 12C15.5 12.5523 15.0523 13 14.5 13C13.9477 13 13.5 12.5523 13.5 12Z"
      fill="#1C274C"
    />
  </IconWrapper>
)

// Checkbox Empty Icon - Empty circle
const CheckboxEmpty = (props: IconProps) => (
  <IconWrapper {...props}>
    <circle
      cx="12"
      cy="12"
      r="10.5"
      stroke="#1C274C"
      strokeWidth="1"
      fill="none"
    />
  </IconWrapper>
)

// Checkbox Checked Icon - Circle with checkmark
const CheckboxChecked = (props: IconProps) => (
  <IconWrapper {...props}>
    <path
      opacity="0.5"
      d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
      fill="#1C274C"
    />
    <path
      d="M16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L12.7348 11.2045L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z"
      fill="#1C274C"
    />
  </IconWrapper>
)

// Export all icons as a namespace
export const IconPack = {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  Menu,
  CheckboxEmpty,
  CheckboxChecked
}

export default IconPack
