'use client'

import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { listStagger, slideUp } from '@/lib/animations/variants'

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
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/20 backdrop-blur-xl z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 w-72 sm:w-80 bg-white/90 backdrop-blur-xl border-r border-gray-200 z-50 flex flex-col overflow-y-auto shadow-2xl"
            style={{
              top: 'var(--topbar-height, 0px)',
              height: 'calc(100vh - var(--topbar-height, 0px))'
            }}
          >
            <motion.nav
              className="flex flex-col gap-1 p-4 sm:p-6"
              variants={listStagger}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={slideUp}>
                <Link
                  href="/"
                  onClick={onClose}
                  className={`flex items-center px-5 py-4 rounded-xl transition-colors duration-200 text-base font-medium ${
                    pathname === '/'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
              </motion.div>
              <motion.div variants={slideUp}>
                <Link
                  href="/applications"
                  onClick={onClose}
                  className={`flex items-center px-5 py-4 rounded-xl transition-colors duration-200 text-base font-medium ${
                    pathname.startsWith('/applications')
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Applications
                </Link>
              </motion.div>
              <motion.div variants={slideUp}>
                <Link
                  href="/newapp"
                  onClick={onClose}
                  className={`flex items-center px-5 py-4 rounded-xl transition-colors duration-200 text-base font-medium ${
                    pathname === '/newapp'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  New Application
                </Link>
              </motion.div>
              <motion.div variants={slideUp}>
                <Link
                  href="/to-do-list"
                  onClick={onClose}
                  className={`flex items-center px-5 py-4 rounded-xl transition-colors duration-200 text-base font-medium ${
                    pathname === '/to-do-list'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  To-Do List
                </Link>
              </motion.div>
              <motion.div variants={slideUp}>
                <Link
                  href="/properties"
                  onClick={onClose}
                  className={`flex items-center px-5 py-4 rounded-xl transition-colors duration-200 text-base font-medium ${
                    pathname.startsWith('/properties')
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Properties
                </Link>
              </motion.div>
              <motion.div variants={slideUp}>
                <Link
                  href="/settings"
                  onClick={onClose}
                  className={`flex items-center px-5 py-4 rounded-xl transition-colors duration-200 text-base font-medium ${
                    pathname.startsWith('/settings')
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Settings
                </Link>
              </motion.div>
              <motion.div variants={slideUp}>
                <Link
                  href="/about"
                  onClick={onClose}
                  className={`flex items-center px-5 py-4 rounded-xl transition-colors duration-200 text-base font-medium ${
                    pathname === '/about'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  About
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
