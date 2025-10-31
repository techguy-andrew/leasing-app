'use client'

import { motion } from 'motion/react'
import { UserButton } from '@clerk/nextjs'
import { fadeIn, listStagger, slideUp } from '@/lib/animations/variants'

/**
 * 🎯 FOREVER-ADAPTABLE TOP BAR
 *
 * Based on Design Philosophy: Section 3 (Flexbox Layout)
 *
 * This top bar uses NATURAL DOCUMENT FLOW instead of fixed positioning.
 * It's the first child in a flex-shrink-0 header container.
 *
 * Key Changes from Old Design:
 * ❌ REMOVED: position: fixed
 * ❌ REMOVED: z-50 stacking
 * ❌ REMOVED: top-0, left-0, right-0
 * ✅ ADDED: Natural flow in flex container
 * ✅ ADDED: Responsive breakpoints (sm, md)
 * ✅ ADDED: Flexible gap spacing
 *
 * Benefits:
 * - Automatically stacks with other headers
 * - No z-index conflicts
 * - No JavaScript height tracking
 * - Responsive padding and sizing
 *
 * @example
 * ```tsx
 * <TopBar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
 * ```
 */

interface TopBarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function TopBar({ isOpen, onToggle }: TopBarProps) {
  return (
    <motion.div
      data-topbar
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="w-full flex flex-row items-center gap-4 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white/85 backdrop-blur-xl border-b border-gray-200 shadow-sm"
    >
      <motion.div
        className="flex flex-row items-center gap-4 w-full"
        variants={listStagger}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={slideUp}>
          <button
            onClick={onToggle}
            className="flex flex-col justify-center items-center w-11 h-11 p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <motion.div
              animate={{
                rotate: isOpen ? 45 : 0,
                y: isOpen ? 8 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="w-6 h-0.5 bg-gray-800 rounded-full"
            />
            <motion.div
              animate={{
                opacity: isOpen ? 0 : 1,
                scaleX: isOpen ? 0 : 1,
              }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="w-6 h-0.5 bg-gray-800 rounded-full my-1.5"
            />
            <motion.div
              animate={{
                rotate: isOpen ? -45 : 0,
                y: isOpen ? -8 : 0,
              }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="w-6 h-0.5 bg-gray-800 rounded-full"
            />
          </button>
        </motion.div>
        <motion.h1 variants={slideUp} className="text-lg sm:text-xl font-semibold text-gray-900 tracking-tight">
          Leasing App
        </motion.h1>
        <motion.div variants={slideUp} className="ml-auto">
          <UserButton afterSignOutUrl="/" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
