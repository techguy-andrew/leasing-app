'use client'

import { motion } from 'motion/react'

export default function Submit() {
  return (
    <motion.button
      type="submit"
      className="flex items-center justify-center w-full h-12 sm:h-14 p-3 sm:p-4 text-base sm:text-lg font-semibold leading-none bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-600/30 transition-all duration-200"
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15 }}
    >
      Submit
    </motion.button>
  )
}
