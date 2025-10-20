'use client'

import { memo } from 'react'
import { motion } from 'motion/react'

/**
 * HeaderCard Component
 *
 * A page header with title and optional description. Features animation on mount.
 *
 * @example
 * ```tsx
 * <HeaderCard
 *   title="Applications"
 *   description="View and manage all lease applications"
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Use for any page header needs
 * 2. Description is optional - omit if not needed
 * 3. Customize animation timing (duration: 0.4) as needed
 * 4. Adjust text sizes (text-2xl sm:text-3xl md:text-4xl) for your design
 * 5. Modify max-width (max-w-5xl) to control content width
 */

interface HeaderCardProps {
  title: string
  description?: string
}

const HeaderCard = memo(function HeaderCard({ title, description }: HeaderCardProps) {
  return (
    <motion.header
      className="w-full bg-white/90 backdrop-blur-lg border-b border-gray-200 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {description}
          </motion.p>
        )}
      </div>
    </motion.header>
  )
})

export default HeaderCard
