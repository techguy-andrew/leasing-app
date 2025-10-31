'use client'

import { useState, useRef, useCallback } from 'react'
import { Reorder } from 'motion/react'
import Pill from '@/components/shared/Pill'
import StatusUpdateModal from '@/components/shared/modals/StatusUpdateModal'

/**
 * StatusListField Component
 *
 * A vertical list component for displaying and reordering status pills.
 * Matches the TasksList pattern with vertical drag-and-drop.
 *
 * Features:
 * - Display statuses in a vertical list (one per line)
 * - Vertical drag-to-reorder functionality
 * - Click to open status selection modal
 * - Debounced status updates (300ms)
 * - Auto-fetches available statuses from API for colors
 *
 * @example
 * ```tsx
 * <StatusListField
 *   statuses={['New', 'Pending']}
 *   onChange={(newStatuses) => setStatuses(newStatuses)}
 * />
 * ```
 */

interface StatusListFieldProps {
  statuses: string[]
  onChange: (statuses: string[]) => void
  readOnly?: boolean
}

interface StatusColorMap {
  [key: string]: string
}

export default function StatusListField({
  statuses,
  onChange,
  readOnly = false
}: StatusListFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusColors, setStatusColors] = useState<StatusColorMap>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastStatusOrderRef = useRef<string[] | null>(null)

  // Fetch status colors from API
  const fetchStatusColors = useCallback(async () => {
    try {
      const response = await fetch('/api/statuses', { cache: 'no-store' })
      const data = await response.json()
      if (response.ok && data.data.length > 0) {
        const colors: StatusColorMap = {}
        data.data.forEach((status: { name: string; color: string }) => {
          colors[status.name] = status.color
        })
        setStatusColors(colors)
      } else {
        // Fallback colors
        setStatusColors({
          'New': '#3B82F6',
          'Pending': '#EAB308',
          'Approved': '#10B981',
          'Rejected': '#EF4444',
          'Outstanding Tasks': '#F59E0B',
          'Ready for Move-In': '#14B8A6',
          'Archived': '#64748B'
        })
      }
    } catch (error) {
      console.error('Failed to fetch status colors:', error)
      // Set fallback colors on error
      setStatusColors({
        'New': '#3B82F6',
        'Pending': '#EAB308',
        'Approved': '#10B981',
        'Rejected': '#EF4444',
        'Outstanding Tasks': '#F59E0B',
        'Ready for Move-In': '#14B8A6',
        'Archived': '#64748B'
      })
    }
  }, [])

  // Fetch colors on mount
  useState(() => {
    fetchStatusColors()
  })

  // Handle reordering with debouncing
  const handleReorder = (newOrder: string[]) => {
    if (readOnly) return

    // Check if the order actually changed
    const orderChanged = JSON.stringify(lastStatusOrderRef.current) !== JSON.stringify(newOrder)
    if (!orderChanged) return

    lastStatusOrderRef.current = newOrder

    // Clear any pending save timeout
    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current)
    }

    // Debounce: wait 300ms after drag settles before calling onChange
    reorderTimeoutRef.current = setTimeout(() => {
      onChange(newOrder)
      reorderTimeoutRef.current = null
    }, 300)
  }

  // Handle status toggle from modal
  const handleStatusToggle = (status: string) => {
    if (readOnly) return

    if (statuses.includes(status)) {
      // Remove status if already selected
      onChange(statuses.filter(s => s !== status))
    } else {
      // Add status if not selected
      onChange([...statuses, status])
    }
  }

  // Get color for a status
  const getStatusColor = (statusName: string): string => {
    return statusColors[statusName] || '#6B7280' // Default grey
  }

  const displayStatuses = statuses.length > 0 ? statuses : []

  return (
    <div ref={containerRef} className="w-full">
      {displayStatuses.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={displayStatuses}
          onReorder={handleReorder}
          className="flex flex-col gap-[2%]"
        >
          {displayStatuses.map((status) => {
            const bgColor = getStatusColor(status)
            return (
              <Reorder.Item
                key={status}
                value={status}
                className={`flex items-center gap-3 ${!readOnly ? 'cursor-grab active:cursor-grabbing' : ''}`}
                drag={!readOnly}
                whileDrag={{
                  scale: 1.02,
                  opacity: 0.8,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  zIndex: 10
                }}
                transition={{
                  layout: { type: 'spring', stiffness: 350, damping: 25 },
                  default: { duration: 0.2 }
                }}
                layout
              >
                <div className="flex items-center gap-2">
                  <Pill
                    label={status}
                    color={bgColor}
                    variant="draggable"
                    onClick={() => !readOnly && setIsModalOpen(true)}
                  />
                </div>
              </Reorder.Item>
            )
          })}
        </Reorder.Group>
      ) : (
        <div onClick={() => !readOnly && setIsModalOpen(true)}>
          <Pill
            label="No status"
            color="#E5E7EB"
            variant="default"
            className="cursor-pointer hover:opacity-80"
          />
        </div>
      )}

      {!readOnly && (
        <StatusUpdateModal
          isOpen={isModalOpen}
          selectedStatuses={statuses}
          onStatusToggle={handleStatusToggle}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
