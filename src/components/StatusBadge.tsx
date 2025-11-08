'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Pill from '@/components/Pill'
import StatusUpdateModal from '@/components/StatusUpdateModal'
import { statusColors as defaultStatusColors } from '@/styles/tokens'

/**
 * StatusBadge Component
 *
 * A clean, modern status badge component that displays status pills in a fixed order.
 * Order is controlled from the Settings page - this component only displays and allows
 * adding/removing statuses via modal.
 *
 * Features:
 * - Display multiple status pills in fixed order
 * - Click to open status selection modal for adding/removing statuses
 * - Uses StatusSelectionModal (portal-based, viewport-aware)
 * - Auto-fetches available statuses from API
 * - Order is determined by Settings page, not reorderable here
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
  externalModalControl?: {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
  }
}

interface StatusColorMap {
  [key: string]: string
}

export default function StatusBadge({
  statuses,
  onChange,
  externalModalControl
}: StatusBadgeProps) {
  const [internalModalOpen, setInternalModalOpen] = useState(false)

  // Use external control if provided, otherwise use internal state
  const isModalOpen = externalModalControl?.isOpen ?? internalModalOpen
  const setIsModalOpen = externalModalControl?.onOpenChange ?? setInternalModalOpen
  const [statusColors, setStatusColors] = useState<StatusColorMap>({})
  const [orderedStatusNames, setOrderedStatusNames] = useState<string[]>([])
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
        // Fallback to design tokens
        setStatusColors(defaultStatusColors)
      }
    } catch (error) {
      console.error('Failed to fetch status colors:', error)
      // Set fallback colors from design tokens on error
      setStatusColors(defaultStatusColors)
    }
  }, [])

  // Fetch status order from Settings page
  const fetchStatusOrder = useCallback(async () => {
    try {
      const response = await fetch('/api/statuses', { cache: 'no-store' })
      const data = await response.json()
      if (response.ok && data.data.length > 0) {
        // Extract ordered status names from Settings
        const orderedNames = data.data.map((status: { name: string }) => status.name)
        setOrderedStatusNames(orderedNames)
      }
    } catch (error) {
      console.error('Failed to fetch status order:', error)
    }
  }, [])

  // Fetch colors and order on mount
  useEffect(() => {
    fetchStatusColors()
    fetchStatusOrder()
  }, [fetchStatusColors, fetchStatusOrder])

  // Handle status toggle from modal (add/remove only, no reordering)
  const handleStatusToggle = (status: string) => {
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

  // Sort statuses to match Settings page order
  const getSortedStatuses = (): string[] => {
    if (statuses.length === 0) return []
    if (orderedStatusNames.length === 0) return statuses // No order loaded yet, use as-is

    // Sort statuses array based on the order from Settings page
    return [...statuses].sort((a, b) => {
      const indexA = orderedStatusNames.indexOf(a)
      const indexB = orderedStatusNames.indexOf(b)

      // Handle statuses not found in ordered list (put at end)
      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1

      return indexA - indexB
    })
  }

  const displayStatuses = getSortedStatuses()

  return (
    <div ref={badgeRef}>
      {displayStatuses.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {displayStatuses.map((status) => {
            const bgColor = getStatusColor(status)
            return (
              <Pill
                key={status}
                label={status}
                color={bgColor}
                variant="default"
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer"
              />
            )
          })}
        </div>
      ) : (
        <Pill
          label="No status"
          color="#E5E7EB"
          variant="default"
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer hover:opacity-80"
        />
      )}

      <StatusUpdateModal
        isOpen={isModalOpen}
        selectedStatuses={statuses}
        onStatusToggle={handleStatusToggle}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
