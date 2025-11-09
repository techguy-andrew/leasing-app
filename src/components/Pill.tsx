'use client'

import styles from '@/components/Pill.module.css'

/**
 * Pill Component
 *
 * A universal, reusable pill/badge component for displaying status labels throughout the app.
 * Based on the ApplicationListItem pill styling with variants for different use cases.
 * Uses design tokens from tokens.css for consistent styling.
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

  // Default variant - static display pill (clickable if onClick provided)
  if (variant === 'default') {
    if (onClick) {
      return (
        <button
          onClick={onClick}
          className={`${styles['pill-default']} ${textColorClass} ${className}`}
          style={{ backgroundColor: color }}
        >
          {label}
        </button>
      )
    }
    return (
      <span
        className={`${styles['pill-default']} ${textColorClass} ${className}`}
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    )
  }

  // Filter variant - clickable pill with optional checkbox
  if (variant === 'filter') {
    const filterClasses = `${styles['pill-filter']} ${
      !isSelected ? styles.unselected : ''
    } ${textColorClass} ${className}`;

    return (
      <button
        onClick={onClick}
        className={`${filterClasses} flex items-center gap-1`}
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
        className={`${styles['pill-draggable']} ${textColorClass} ${className}`}
        style={{ backgroundColor: color }}
        onClick={onClick}
      >
        {label}
      </span>
    )
  }

  return null
}
