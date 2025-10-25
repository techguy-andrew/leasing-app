'use client'

import { useState, useRef, useCallback } from 'react'
import { Reorder } from 'motion/react'
import Pill from '@/components/shared/Pill'
import StatusSelectionModal from '@/components/shared/modals/StatusSelectionModal'

/**
 * StatusBadge Component
 *
 * A clean, modern status badge component that displays status pills flat on the canvas
 * with drag-to-reorder functionality and a modal for status selection.
 *
 * Features:
 * - Display multiple status pills
 * - Drag-to-reorder statuses
 * - Click to open status selection modal
 * - Uses StatusSelectionModal (portal-based, viewport-aware)
 * - Auto-fetches available statuses from API
 *
 * @example
 * ```tsx
 * <StatusBadge
 *   statuses={['New', 'Pending']}
 *   onChange={(newStatuses) => setStatuses(newStatuses)}
 * />
 * ```
 */

interface StatusBadgeProps {
  statuses: string[]
  onChange: (statuses: string[]) => void
  readOnly?: boolean
}

interface StatusColorMap {
  [key: string]: string
}

export default function StatusBadge({
  statuses,
  onChange,
  readOnly = false
}: StatusBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusColors, setStatusColors] = useState<StatusColorMap>({})
  const badgeRef = useRef<HTMLDivElement>(null)

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

  // Fetch colors on mount and when modal opens
  useState(() => {
    fetchStatusColors()
  })

  // Handle reordering
  const handleReorder = (newOrder: string[]) => {
    if (!readOnly) {
      onChange(newOrder)
    }
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
    <div ref={badgeRef}>
      {displayStatuses.length > 0 ? (
        <Reorder.Group
          axis="x"
          values={displayStatuses}
          onReorder={handleReorder}
          className="flex flex-wrap gap-1 list-none"
          style={{ listStyle: 'none' }}
          as="div"
        >
          {displayStatuses.map((status) => {
            const bgColor = getStatusColor(status)
            return (
              <Reorder.Item
                key={status}
                value={status}
                whileDrag={{
                  scale: 1.05,
                  opacity: 0.8,
                  zIndex: 10
                }}
                drag={!readOnly}
              >
                <Pill
                  label={status}
                  color={bgColor}
                  variant="draggable"
                  onClick={() => !readOnly && setIsModalOpen(true)}
                />
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
        <StatusSelectionModal
          isOpen={isModalOpen}
          triggerRef={badgeRef}
          selectedStatuses={statuses}
          onStatusToggle={handleStatusToggle}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
