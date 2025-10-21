'use client'

import { motion } from 'motion/react'
import { UserButton } from '@clerk/nextjs'
import { fadeIn, listStagger, slideUp } from '@/lib/animations/variants'

interface TopBarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function TopBar({ isOpen, onToggle }: TopBarProps) {
  return (
    <motion.div
      data-topbar
      className="fixed top-0 left-0 right-0 w-full h-fit flex flex-row items-center gap-4 px-4 sm:px-6 py-4 bg-white/85 backdrop-blur-xl border-b border-gray-200 shadow-sm z-50"
      variants={fadeIn}
      initial="initial"
      animate="animate"
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
