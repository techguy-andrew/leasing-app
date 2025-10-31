'use client'

import { motion } from 'motion/react'
import { fadeIn } from '@/lib/animations/variants'
import IconPack from '@/components/shared/icons/IconPack'

/**
 * 🎯 FOREVER-ADAPTABLE SEARCH BOX
 * 
 * Based on Design Philosophy: Section 3 (Flexbox Layout)
 * 
 * This search box uses NATURAL DOCUMENT FLOW.
 * It's a child in the flex-shrink-0 header container.
 * 
 * Key Changes from Old Design:
 * ❌ REMOVED: position: fixed
 * ❌ REMOVED: style={{ top: 'var(--topbar-height)' }}
 * ❌ REMOVED: z-index positioning
 * ✅ ADDED: Natural flow in flex container
 * ✅ ADDED: Full responsive design
 * 
 * Benefits:
 * - No overlap with other elements
 * - Automatic spacing in flex layout
 * - Works on all screen sizes
 * 
 * @example
 * ```tsx
 * <SearchBox />
 * ```
 */

export default function SearchBox() {
  return (
    <motion.div
      data-searchbox
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="w-full flex flex-row items-center gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white border-b border-gray-200"
    >
      {/* Search Icon */}
      <IconPack 
        icon="search" 
        className="w-5 h-5 text-gray-400 flex-shrink-0" 
      />

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search applications..."
        className="flex-1 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:ring-0"
      />
    </motion.div>
  )
}
