'use client'

import { motion } from 'motion/react'
import { fadeIn, slideUp } from '@/lib/animations/variants'

/**
 * 🎯 FOREVER-ADAPTABLE TOOLBAR
 *
 * Based on Design Philosophy: Section 3 (Flexbox Layout)
 *
 * This toolbar uses NATURAL DOCUMENT FLOW instead of fixed positioning.
 * It's wrapped in a flex-shrink-0 header container in NavigationLayout.
 *
 * Key Changes from Old Design:
 * ❌ REMOVED: position: fixed
 * ❌ REMOVED: style={{ top: 'var(--topbar-height)' }}
 * ❌ REMOVED: z-index stacking
 * ✅ ADDED: Natural flow in flex container
 * ✅ ADDED: Responsive breakpoints
 *
 * Benefits:
 * - No overlap issues
 * - No JavaScript height calculations
 * - Works on all screen sizes automatically
 * - No z-index fighting
 *
 * @example
 * ```tsx
 * <ToolBar
 *   onSendStatusMessage={() => setShowModal(true)}
 *   onUpdateStatus={() => setShowUpdateModal(true)}
 * />
 * ```
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
      className="w-full flex flex-row items-center justify-start gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200"
    >
      {/* Tools Container with responsive wrapping */}
      <motion.div
        className="flex flex-row flex-wrap gap-2 sm:gap-3"
        variants={slideUp}
        initial="hidden"
        animate="visible"
      >
        {/* Update Status Button */}
        <button
          onClick={onUpdateStatus}
          className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white rounded-full transition-all hover:opacity-90 hover:scale-105 active:scale-95 cursor-pointer"
          style={{ backgroundColor: '#10B981' }}
        >
          Update Status
        </button>

        {/* Send Status Message Button */}
        <button
          onClick={onSendStatusMessage}
          className="px-3 py-1.5 text-xs sm:text-sm font-medium text-white rounded-full transition-all hover:opacity-90 hover:scale-105 active:scale-95 cursor-pointer"
          style={{ backgroundColor: '#457b9d' }}
        >
          Send Status Message
        </button>
      </motion.div>
    </motion.div>
  )
}
