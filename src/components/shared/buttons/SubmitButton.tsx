'use client'

import { motion } from 'motion/react'

/**
 * SubmitButton Component
 *
 * A modern, gradient submit button with loading state and smooth Framer Motion animations.
 * Features ultra-smooth loading spinner and minimal hover effects.
 *
 * @example
 * ```tsx
 * <SubmitButton
 *   onClick={handleSubmit}
 *   isLoading={isSaving}
 *   disabled={!isValid}
 *   variant="primary"
 * >
 *   Save Changes
 * </SubmitButton>
 * ```
 *
 * To adapt for new projects:
 * 1. Adjust gradient colors (from-blue-500 to-purple-600) for your brand
 * 2. Modify size with px/py padding classes
 * 3. Add more variants as needed (primary, destructive, success)
 */

interface SubmitButtonProps {
  onClick?: () => void
  isLoading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'destructive'
  children: React.ReactNode
  type?: 'button' | 'submit'
  className?: string
}

export default function SubmitButton({
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  children,
  type = 'button',
  className = ''
}: SubmitButtonProps) {
  const isDisabled = disabled || isLoading

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    destructive: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
  }

  return (
    <motion.button
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        relative px-6 py-3 text-base font-semibold text-white rounded-xl
        ${variantStyles[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90'}
        transition-opacity duration-200 shadow-lg
        ${variant === 'primary' ? 'shadow-blue-500/30' : 'shadow-red-500/30'}
        ${className}
      `}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          {/* Loading Spinner */}
          <motion.svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="60"
              strokeDashoffset="15"
              opacity="0.3"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="15 45"
              opacity="1"
            />
          </motion.svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  )
}
