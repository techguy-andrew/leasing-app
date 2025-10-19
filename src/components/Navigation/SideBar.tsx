'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SideBarProps {
  isOpen: boolean
  onClose: () => void
}

export default function SideBar({ isOpen, onClose }: SideBarProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[65px] backdrop-blur-lg z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-[65px] left-0 w-64 h-[calc(100vh-65px)] bg-white border-r-2 border-l-2 border-b-2 border-gray-200 z-50 flex flex-col overflow-y-auto shadow-xl"
          >
            <nav className="flex flex-col gap-2 p-4">
              <Link
                href="/"
                onClick={onClose}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors text-base font-medium ${
                  pathname === '/'
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              <Link
                href="/newapp"
                onClick={onClose}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors text-base font-medium ${
                  pathname === '/newapp'
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                New Application
              </Link>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
