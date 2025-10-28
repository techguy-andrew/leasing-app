'use client'

import { motion } from 'motion/react'
import { fadeIn, pulsingDot } from '@/lib/animations/variants'

/**
 * LoadingScreen Component
 *
 * A modern, minimal loading animation featuring 3 pulsing dots
 * that animate in sequence for a wave effect.
 *
 * Uses centralized animation variants for consistency across the app.
 *
 * @example
 * ```tsx
 * {isLoading && <LoadingScreen />}
 * ```
 */

export default function LoadingScreen() {
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex items-center justify-center py-16"
    >
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            variants={pulsingDot}
            initial="initial"
            animate="animate"
            transition={{
              delay: index * 0.15,
            }}
            className="w-2 h-2 rounded-full bg-gray-400"
          />
        ))}
      </div>
    </motion.div>
  )
}
