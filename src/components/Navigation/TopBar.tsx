'use client'

import { motion } from 'motion/react'

interface TopBarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function TopBar({ isOpen, onToggle }: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-row items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-md border-b-2 border-gray-300 shadow-sm">
      <button
        onClick={onToggle}
        className="flex flex-col justify-center items-center w-10 h-10 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <motion.div
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 8 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-6 h-0.5 bg-gray-800"
        />
        <motion.div
          animate={{
            opacity: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
          className="w-6 h-0.5 bg-gray-800 my-1.5"
        />
        <motion.div
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -8 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-6 h-0.5 bg-gray-800"
        />
      </button>
      <h1 className="text-xl font-semibold text-gray-900">Leasing App</h1>
    </div>
  )
}
