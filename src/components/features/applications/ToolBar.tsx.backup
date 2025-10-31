'use client'

import { motion } from 'motion/react'
import { fadeIn, slideUp } from '@/lib/animations/variants'

/**
 * ToolBar Component
 *
 * A reusable toolbar component for application detail pages.
 * Provides action buttons and tools for managing individual applications.
 *
 * @example
 * ```tsx
 * <ToolBar
 *   onSendStatusMessage={() => setShowModal(true)}
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Add new tool button props as needed
 * 2. Extend the interface with additional callbacks
 * 3. Add new button sections following the same pattern
 */

interface ToolBarProps {
  onSendStatusMessage: () => void
  onUpdateStatus: () => void
}

export default function ToolBar({
  onSendStatusMessage,
  onUpdateStatus
}: ToolBarProps) {
  return (
    <motion.div
      data-toolbar
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="fixed left-0 right-0 w-full h-fit flex flex-row items-center justify-start gap-4 px-6 py-4 bg-white border-b border-gray-200 z-30"
      style={{ top: 'var(--topbar-height, 0px)' }}
    >
      {/* Tools Container */}
      <motion.div
        className="flex flex-row flex-wrap gap-3"
        variants={slideUp}
        initial="hidden"
        animate="visible"
      >
        {/* Update Status Button */}
        <button
          onClick={onUpdateStatus}
          className="px-2 py-0.5 text-xs font-medium text-white rounded-full transition-colors hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: '#10B981' }}
        >
          Update Status
        </button>

        {/* Send Status Message Button */}
        <button
          onClick={onSendStatusMessage}
          className="px-2 py-0.5 text-xs font-medium text-white rounded-full transition-colors hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: '#457b9d' }}
        >
          Send Status Message
        </button>

      </motion.div>
    </motion.div>
  )
}
