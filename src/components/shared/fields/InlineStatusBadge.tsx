'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion, Reorder } from 'motion/react'

/**
 * InlineStatusBadge Component
 *
 * A clickable status badge with multi-select dropdown. Displays multiple status badges.
 * Auto-closes on outside click.
 *
 * @example
 * ```tsx
 * const STATUS_OPTIONS = [
 *   { value: 'New', label: 'New' },
 *   { value: 'Pending', label: 'Pending' },
 *   { value: 'Approved', label: 'Approved' }
 * ]
 *
 * <InlineStatusBadge
 *   status={formData.status}
 *   onChange={(value) => setFormData({ ...formData, status: value })}
 *   options={STATUS_OPTIONS}
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Manage statuses via the Settings page (/settings)
 * 2. Statuses are fetched from /api/statuses with dynamic colors
 * 3. Modify InlineTextField for custom status name editing
 * 4. Always clickable - no read-only mode
 * 5. Supports multiple simultaneous statuses and drag-to-reorder
 */

interface StatusOption {
  value: string
  label: string
  color?: string
}

interface InlineStatusBadgeProps {
  status: string[]
  onChange: (status: string[]) => void
  options?: StatusOption[]
}

interface ApiStatus {
  id: string
  name: string
  color: string
  order: number
}

export default function InlineStatusBadge({
  status,
  onChange,
  options: legacyOptions
}: InlineStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [availableStatuses, setAvailableStatuses] = useState<ApiStatus[]>([])
  const badgeRef = useRef<HTMLDivElement>(null)

  // Fetch available statuses from API
  const fetchStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/statuses', { cache: 'no-store' })
      const data = await response.json()
      if (response.ok && data.data.length > 0) {
        setAvailableStatuses(data.data)
      } else {
        // Fallback: create mock status objects for legacy statuses
        const legacyStatuses: ApiStatus[] = [
          { id: 'new', name: 'New', color: '#3B82F6', order: 0 },
          { id: 'pending', name: 'Pending', color: '#EAB308', order: 1 },
          { id: 'approved', name: 'Approved', color: '#10B981', order: 2 },
          { id: 'rejected', name: 'Rejected', color: '#EF4444', order: 3 },
          { id: 'tasks', name: 'Outstanding Tasks', color: '#F59E0B', order: 4 },
          { id: 'ready', name: 'Ready for Move-In', color: '#14B8A6', order: 5 },
          { id: 'archived', name: 'Archived', color: '#64748B', order: 6 }
        ]
        setAvailableStatuses(legacyStatuses)
      }
    } catch (error) {
      console.error('Failed to fetch statuses:', error)
      // Set fallback on error
      const legacyStatuses: ApiStatus[] = [
        { id: 'new', name: 'New', color: '#3B82F6', order: 0 },
        { id: 'pending', name: 'Pending', color: '#EAB308', order: 1 },
        { id: 'approved', name: 'Approved', color: '#10B981', order: 2 },
        { id: 'rejected', name: 'Rejected', color: '#EF4444', order: 3 },
        { id: 'tasks', name: 'Outstanding Tasks', color: '#F59E0B', order: 4 },
        { id: 'ready', name: 'Ready for Move-In', color: '#14B8A6', order: 5 },
        { id: 'archived', name: 'Archived', color: '#64748B', order: 6 }
      ]
      setAvailableStatuses(legacyStatuses)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchStatuses()
  }, [fetchStatuses])

  // Refetch when dropdown opens to get latest statuses
  useEffect(() => {
    if (isOpen) {
      fetchStatuses()
    }
  }, [isOpen, fetchStatuses])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (badgeRef.current && !badgeRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = (selectedStatus: string) => {
    if (status.includes(selectedStatus)) {
      // Remove status if already selected (now allows empty array)
      onChange(status.filter(s => s !== selectedStatus))
    } else {
      // Add status if not selected
      onChange([...status, selectedStatus])
    }
  }

  const handleReorder = (newOrder: string[]) => {
    onChange(newOrder)
  }

  // Get color for a status name
  const getStatusColor = (statusName: string): string => {
    const apiStatus = availableStatuses.find(s => s.name === statusName)
    return apiStatus?.color || '#6B7280' // Default grey
  }

  // Helper to get text color based on background
  const getTextColorClass = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? 'text-gray-900' : 'text-white'
  }

  // Use API statuses if available, otherwise fallback to legacy options
  const options = availableStatuses.length > 0
    ? availableStatuses.map(s => ({ value: s.name, label: s.name, color: s.color }))
    : legacyOptions || []

  const displayStatuses = status.length > 0 ? status : []

  return (
    <div className="relative inline-block" ref={badgeRef}>
      {displayStatuses.length > 0 ? (
        <Reorder.Group
          axis="x"
          values={displayStatuses}
          onReorder={handleReorder}
          className="flex flex-wrap gap-1"
          as="div"
        >
          {displayStatuses.map((s) => {
            const bgColor = getStatusColor(s)
            const textColorClass = getTextColorClass(bgColor)
            return (
              <Reorder.Item
                key={s}
                value={s}
                className="cursor-grab active:cursor-grabbing"
                whileDrag={{
                  scale: 1.05,
                  opacity: 0.8,
                  zIndex: 10
                }}
                drag
                onClick={() => setIsOpen(!isOpen)}
              >
                <span
                  className={`px-2 py-0.5 text-xs font-sans font-medium rounded-full hover:opacity-80 transition-opacity select-none ${textColorClass}`}
                  style={{ backgroundColor: bgColor }}
                >
                  {s}
                </span>
              </Reorder.Item>
            )
          })}
        </Reorder.Group>
      ) : (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer"
        >
          <span className="px-2 py-0.5 text-xs font-sans font-medium rounded-full bg-gray-100 text-gray-400 hover:opacity-80 transition-opacity">
            No status
          </span>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
          >
            <div className="py-1">
              {options.map((option) => {
                const isSelected = status.includes(option.value)
                const bgColor = option.color || getStatusColor(option.value)
                const textColorClass = getTextColorClass(bgColor)
                return (
                  <button
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 transition-colors font-sans flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span
                      className={`px-2 py-0.5 text-xs font-sans font-medium rounded-full ${textColorClass}`}
                      style={{ backgroundColor: bgColor }}
                    >
                      {option.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
