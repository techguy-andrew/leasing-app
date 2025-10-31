'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log error to console
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white/95 backdrop-blur-lg border border-gray-200 rounded-2xl p-8 shadow-xl text-center"
      >
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            We encountered an unexpected error. You can try again or return to the home page.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <p className="text-xs font-semibold text-red-800 mb-2">
                Error Details (Development Mode):
              </p>
              <p className="text-sm text-red-700 font-mono break-all mb-2">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600">
                  Error ID: {error.digest}
                </p>
              )}
              {error.stack && (
                <details className="mt-3">
                  <summary className="text-xs font-semibold text-red-800 cursor-pointer hover:text-red-900">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-40 bg-red-100/50 p-2 rounded">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}
