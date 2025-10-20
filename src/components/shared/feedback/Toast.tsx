'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string | null
  type?: ToastType
  duration?: number
  onClose: () => void
}

const toastStyles = {
  success: {
    bg: 'bg-green-600',
    text: 'text-white',
    icon: CheckCircle
  },
  error: {
    bg: 'bg-red-600',
    text: 'text-white',
    icon: XCircle
  },
  warning: {
    bg: 'bg-yellow-600',
    text: 'text-white',
    icon: AlertCircle
  },
  info: {
    bg: 'bg-blue-600',
    text: 'text-white',
    icon: Info
  }
}

export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose
}: ToastProps) {
  const style = toastStyles[type]
  const Icon = style.icon

  useEffect(() => {
    if (message && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration, onClose])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
          <div
            className={`${style.bg} ${style.text} px-6 py-3.5 rounded-full shadow-lg flex items-center gap-3 min-w-[300px] max-w-[500px]`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
