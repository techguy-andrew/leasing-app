'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'

/**
 * OptionsModal Component
 *
 * A modern floating menu with dynamic positioning that automatically adjusts placement
 * based on available viewport space. Uses React portals to prevent overflow clipping.
 *
 * Features:
 * - Dynamic positioning (above/below trigger based on viewport space)
 * - React portal rendering to prevent container overflow
 * - Smooth entrance/exit animations with CSS transforms
 * - Click-outside detection for auto-close
 * - Escape key support for accessibility
 * - Touch-friendly targets (44x44px minimum)
 * - getBoundingClientRect() for precise positioning
 *
 * @example
 * ```tsx
 * const [showMenu, setShowMenu] = useState(false)
 * const buttonRef = useRef<HTMLButtonElement>(null)
 *
 * <button ref={buttonRef} onClick={() => setShowMenu(true)}>Options</button>
 *
 * <OptionsModal
 *   isOpen={showMenu}
 *   triggerRef={buttonRef}
 *   actions={[
 *     { label: 'Edit', icon: <EditIcon />, onClick: handleEdit },
 *     { label: 'Delete', icon: <DeleteIcon />, onClick: handleDelete, destructive: true }
 *   ]}
 *   onClose={() => setShowMenu(false)}
 * />
 * ```
 */

export interface ModalAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  destructive?: boolean
}

interface OptionsModalProps {
  isOpen: boolean
  triggerRef: React.RefObject<HTMLElement | null>
  actions: ModalAction[]
  onClose: () => void
  align?: 'left' | 'right'
  offsetX?: number
  offsetY?: number
}

export default function OptionsModal({
  isOpen,
  triggerRef,
  actions,
  onClose,
  align = 'right',
  offsetX = 0,
  offsetY = 8
}: OptionsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'below' as 'above' | 'below' })
  const [mounted, setMounted] = useState(false)

  // Track if component is mounted (for portal)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate optimal position based on viewport space
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !modalRef.current) return

    const calculatePosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect()
      const modal = modalRef.current?.getBoundingClientRect()

      if (!trigger || !modal) return

      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      // Calculate space above and below trigger
      const spaceBelow = viewportHeight - trigger.bottom
      const spaceAbove = trigger.top

      // Determine if modal should appear above or below
      const modalHeight = modal.height || 200 // Estimated height if not yet rendered
      const shouldPlaceAbove = spaceBelow < modalHeight && spaceAbove > spaceBelow

      // Calculate vertical position
      let top: number
      if (shouldPlaceAbove) {
        top = trigger.top + scrollY - modalHeight - offsetY
      } else {
        top = trigger.bottom + scrollY + offsetY
      }

      // Calculate horizontal position based on alignment
      let left: number
      if (align === 'right') {
        left = trigger.right + scrollX - modal.width + offsetX
      } else {
        left = trigger.left + scrollX + offsetX
      }

      // Ensure modal stays within viewport horizontally
      const rightEdge = left + modal.width
      if (rightEdge > viewportWidth + scrollX) {
        left = viewportWidth + scrollX - modal.width - 16 // 16px padding from edge
      }
      if (left < scrollX + 16) {
        left = scrollX + 16
      }

      setPosition({
        top: Math.max(scrollY + 16, top),
        left,
        placement: shouldPlaceAbove ? 'above' : 'below'
      })
    }

    // Initial calculation
    calculatePosition()

    // Recalculate on scroll or resize
    window.addEventListener('scroll', calculatePosition, { passive: true })
    window.addEventListener('resize', calculatePosition, { passive: true })

    return () => {
      window.removeEventListener('scroll', calculatePosition)
      window.removeEventListener('resize', calculatePosition)
    }
  }, [isOpen, triggerRef, align, offsetX, offsetY])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    // Small delay to prevent immediate close from trigger click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, triggerRef])

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle action click
  const handleAction = (action: ModalAction) => {
    action.onClick()
    onClose()
  }

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          initial={{
            opacity: 0,
            scale: 0.95,
            y: position.placement === 'below' ? -8 : 8
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: position.placement === 'below' ? -8 : 8
          }}
          transition={{
            duration: 0.15,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999
          }}
          className="min-w-[10rem] w-max max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="py-1">
            {actions.map((action, index) => (
              <div key={index}>
                {index > 0 && <div className="border-t border-gray-200" />}
                <button
                  onClick={() => handleAction(action)}
                  className={`
                    flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium
                    transition-colors cursor-pointer text-left whitespace-nowrap
                    min-h-[44px] min-w-[44px]
                    ${action.destructive
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  type="button"
                  role="menuitem"
                >
                  {action.icon && (
                    <span className="flex-shrink-0 w-4 h-4">
                      {action.icon}
                    </span>
                  )}
                  <span>{action.label}</span>
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
