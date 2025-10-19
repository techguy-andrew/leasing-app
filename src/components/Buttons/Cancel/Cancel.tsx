'use client'

import { motion } from 'motion/react'

interface CancelButtonProps {
  onClick: () => void
}

export default function Cancel({ onClick }: CancelButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center p-2 sm:p-2.5 text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-all duration-200"
      aria-label="Cancel"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05, rotate: 90 }}
      transition={{ duration: 0.2 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </motion.button>
  )
}
