'use client'

import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import IconPack from '@/components/IconPack'
import { ExtractedData } from '@/lib/pdf/smartExtractor'

interface PDFUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onDataExtracted: (data: ExtractedData) => void
}

export default function PDFUploadModal({
  isOpen,
  onClose,
  onDataExtracted
}: PDFUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    console.log('File selected:', file.name, file.type, file.size)

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      setError(`Please upload a PDF file. You uploaded: ${file.type || 'unknown type'}`)
      return
    }

    // Validate file size (10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setError('PDF file is too large (max 10MB)')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('pdf', file)

      console.log('Uploading PDF to API...')

      // Upload and extract
      const response = await fetch('/api/applications/extract-pdf', {
        method: 'POST',
        body: formData
      })

      console.log('API response status:', response.status)

      const result = await response.json()
      console.log('API response data:', result)

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract PDF data')
      }

      // Pass extracted data to parent
      onDataExtracted(result.data)
      onClose()
    } catch (err) {
      console.error('PDF extraction error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process PDF')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
          style={{ top: 'var(--header-height, 0px)' }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 bg-black/20 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.3
            }}
            className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 border border-blue-200 flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">
                  Upload PDF
                </h3>
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-2"
                disabled={isUploading}
              >
                <IconPack.Cancel size="default" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                  transition-all duration-200
                  ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={!isUploading ? handleBrowseClick : undefined}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />

                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-gray-600">
                      Processing PDF...
                    </p>
                    <p className="text-xs text-gray-400">
                      This may take a moment
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Drag & drop PDF here
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        or <span className="text-blue-600 font-medium">browse</span> to choose file
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Max file size: 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Tip</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Upload an AppFolio PDF to automatically extract applicant information.
                      Works with both text-based and scanned PDFs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
