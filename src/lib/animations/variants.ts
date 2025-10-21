/**
 * Framer Motion Animation Variants
 * Reusable animation configurations for consistent motion design
 *
 * Timing Standards:
 * - Quick interactions: 0.2-0.3s
 * - Element entrance: 0.3-0.4s
 * - Page transitions: 0.5-0.6s
 *
 * Easing Standards:
 * - Entrance: easeOut
 * - Exit: easeIn
 * - Both: easeInOut
 */

import { Variants } from 'motion/react'

/**
 * Fade In Variant
 * Simple opacity fade for quick interactions
 * States: 'hidden' | 'visible' or 'initial' | 'animate'
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

/**
 * Scale In Variant
 * Subtle scale animation for element entrance
 * States: 'hidden' | 'visible' or 'initial' | 'animate'
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

/**
 * Slide Up Variant
 * Upward slide with fade for content reveals
 * States: 'hidden' | 'visible' or 'initial' | 'animate'
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
}

/**
 * Pulsing Dot Variant
 * For loading animation dots
 * States: 'initial' | 'animate'
 */
export const pulsingDot: Variants = {
  initial: { scale: 0.6, opacity: 0.4 },
  animate: {
    scale: [0.6, 1, 0.6],
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
}

/**
 * List Stagger Container Variant
 * Optimized for list items with quick stagger
 * States: 'hidden' | 'visible'
 */
export const listStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

/**
 * Page Transition Variant
 * For page-level animations
 * States: 'initial' | 'animate' | 'exit'
 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4, ease: 'easeIn' },
  },
}

/**
 * Stagger Container Variant
 * Use on parent elements to orchestrate staggered children animations
 * States: 'hidden' | 'visible'
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

/**
 * Stagger Item Variant
 * Use on child elements within a stagger container
 * States: 'hidden' | 'visible'
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
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
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

/**
 * Form Field Stagger Container
 * For cascading form field entrance
 * States: 'hidden' | 'visible'
 */
export const formFieldStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

/**
 * Form Field Item
 * Individual form field entrance
 * States: 'hidden' | 'visible'
 */
export const formFieldItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}
