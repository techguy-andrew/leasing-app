'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'

export default function ApplicationDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log error to console
    console.error('Application detail error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full bg-gradient-to-b from-gray-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full bg-white/95 backdrop-blur-lg border border-gray-200 rounded-2xl p-10 shadow-xl text-center"
      >
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Failed to Load Application
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            We couldn't load this application. It may not exist, or there might be a temporary problem.
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
                <p className="text-xs text-red-600 mb-2">
                  Error ID: {error.digest}
                </p>
              )}
              {error.stack && (
                <details className="mt-3">
                  <summary className="text-xs font-semibold text-red-800 cursor-pointer hover:text-red-900">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-32 bg-red-100/50 p-2 rounded">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="flex-1 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
          <button
            onClick={() => router.push('/applications')}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Applications
          </button>
        </div>
      </motion.div>
    </div>
  )
}
