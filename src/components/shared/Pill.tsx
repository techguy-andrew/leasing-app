'use client'

import { Reorder } from 'motion/react'

/**
 * Pill Component
 *
 * A universal, reusable pill/badge component for displaying status labels throughout the app.
 * Based on the ApplicationListItem pill styling with variants for different use cases.
 *
 * @example
 * ```tsx
 * // Display-only pill (like ApplicationListItem)
 * <Pill label="New" color="#3B82F6" />
 *
 * // Clickable filter pill with checkbox (like FilterBar)
 * <Pill
 *   label="Pending"
 *   color="#EAB308"
 *   variant="filter"
 *   onClick={() => handleFilter('Pending')}
 *   isSelected={true}
 *   showCheckbox={true}
 * />
 *
 * // Draggable pill (like InlineStatusBadge)
 * <Pill
 *   label="Approved"
 *   color="#10B981"
 *   variant="draggable"
 *   onClick={() => setIsOpen(true)}
 * />
 * ```
 */

interface PillProps {
  label: string
  color: string
  variant?: 'default' | 'filter' | 'draggable'
  onClick?: () => void
  showCheckbox?: boolean
  isSelected?: boolean
  className?: string
}

export default function Pill({
  label,
  color,
  variant = 'default',
  onClick,
  showCheckbox = false,
  isSelected = false,
  className = ''
}: PillProps) {
  // Helper to get text color based on background luminance
  const getTextColorClass = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? 'text-gray-900' : 'text-white'
  }

  const textColorClass = getTextColorClass(color)

  // Base classes from ApplicationListItem
  const baseClasses = `px-3 py-1.5 text-xs font-semibold rounded-full w-fit ${textColorClass} ${className}`

  // Default variant - static display pill
  if (variant === 'default') {
    return (
      <span
        className={baseClasses}
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    )
  }

  // Filter variant - clickable pill with optional checkbox
  if (variant === 'filter') {
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} transition-colors flex items-center gap-1 ${
          !isSelected ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' : ''
        }`}
        style={isSelected ? { backgroundColor: color } : {}}
      >
        {showCheckbox && label !== 'All' && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="w-3 h-3 rounded border-gray-300 pointer-events-none"
          />
        )}
        {label}
      </button>
    )
  }

  // Draggable variant - interactive pill with drag-to-reorder (used inside Reorder.Item)
  if (variant === 'draggable') {
    return (
      <span
        className={`${baseClasses} hover:opacity-80 transition-opacity select-none cursor-grab active:cursor-grabbing`}
        style={{ backgroundColor: color }}
        onClick={onClick}
      >
        {label}
      </span>
    )
  }

  return null
}
