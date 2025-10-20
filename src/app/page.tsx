'use client'

import { motion } from 'motion/react'
import HeaderCard from '@/components/shared/cards/HeaderCard'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div className="w-full">
        <HeaderCard
          title="Leasing Application Portal"
          description="Manage and submit lease applications with ease"
        />
      </div>
      <div className="flex flex-col items-center justify-center flex-1 p-4 sm:p-6 md:p-8 lg:p-12 bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          className="flex flex-col items-center justify-center gap-6 sm:gap-8 w-full max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Welcome to Leasing App
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-600 text-center max-w-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Use the menu to navigate through applications
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link
              href="/applications"
              className="px-8 py-4 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 text-center"
            >
              View Applications
            </Link>
            <Link
              href="/newapp"
              className="px-8 py-4 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300 rounded-xl shadow-sm transition-all duration-200 text-center"
            >
              New Application
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
