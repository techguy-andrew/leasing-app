'use client'

import { motion } from 'motion/react'

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
}

export default function ToolBar({
  onSendStatusMessage
}: ToolBarProps) {
  return (
    <motion.div
      data-toolbar
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 right-0 w-full h-fit flex flex-row items-center justify-start gap-4 px-6 py-4 bg-white border-b border-gray-200 z-30"
      style={{ top: 'calc(var(--topbar-height, 0px) + var(--navbar-height, 0px))' }}
    >
      {/* Tools Container */}
      <div className="flex flex-row flex-wrap gap-3">

        {/* Send Status Message Button */}
        <button
          onClick={onSendStatusMessage}
          className="px-2 py-0.5 text-xs font-medium text-white rounded-full transition-colors hover:opacity-90"
          style={{ backgroundColor: '#457b9d' }}
        >
          Send Status Message
        </button>

        {/* Future tools can be added here */}

      </div>
    </motion.div>
  )
}
