'use client'

import { motion } from 'motion/react'
import { fadeIn } from '@/lib/animations/variants'
import { UserButton } from '@clerk/nextjs'
import IconPack from '@/components/shared/icons/IconPack'

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
      className="w-full flex flex-row items-center justify-between gap-4 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white border-b border-gray-200"
    >
      {/* Left Section: Menu Button + App Title */}
      <div className="flex flex-row items-center gap-3 sm:gap-4">
        {/* Menu Toggle Button */}
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
          aria-label="Toggle menu"
        >
          <IconPack 
            icon={isOpen ? 'close' : 'menu'} 
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" 
          />
        </button>

        {/* App Title */}
        <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
          Leasing App
        </h1>
      </div>

      {/* Right Section: User Button */}
      <div className="flex items-center">
        <UserButton 
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10'
            }
          }}
        />
      </div>
    </motion.div>
  )
}
