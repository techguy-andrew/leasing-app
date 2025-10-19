/**
 * Framer Motion Animation Variants
 * Reusable animation configurations for consistent motion design
 */

import { Variants } from 'motion/react'

/**
 * Stagger Container Variant
 * Use on parent elements to orchestrate staggered children animations
 * States: 'hidden' | 'visible'
 */
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
      duration: 0.3,
    },
  },
}

/**
 * Stagger Item Variant
 * Use on child elements within a stagger container
 * States: 'hidden' | 'visible'
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

/**
 * Fade In Up Variant
 * Simple fade-in with upward motion
 * States: 'initial' | 'animate'
 */
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}
