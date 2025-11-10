'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import IconPack from '@/components/IconPack'
import { ExtractedData } from '@/lib/pdf/smartExtractor'

interface PDFPreviewModalProps {
  isOpen: boolean
  extractedData: ExtractedData | null
  onClose: () => void
  onUseData: (data: ExtractedData) => void
}

export default function PDFPreviewModal({
  isOpen,
  extractedData,
  onClose,
  onUseData
}: PDFPreviewModalProps) {
  const [editedData, setEditedData] = useState<ExtractedData | null>(extractedData)

  // Update edited data when extracted data changes
  if (extractedData && editedData !== extractedData) {
    setEditedData(extractedData)
  }

  const handleFieldChange = (field: keyof Omit<ExtractedData, 'confidence' | 'metadata'>, value: string) => {
    if (!editedData) return
    setEditedData({
      ...editedData,
      [field]: value
    })
  }

  const handleUseData = () => {
    if (editedData) {
      onUseData(editedData)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200'
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.5) return 'Medium'
    return 'Low'
  }

  if (!editedData) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
            className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100%-3rem)] flex flex-col border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100 border border-green-200 flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Review Extracted Data
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Extracted via {editedData.metadata.extractionMethod === 'ocr' ? 'OCR' : 'PDF Parser'} • {editedData.metadata.processingTime}ms
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-2"
              >
                <IconPack.Cancel size="default" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {/* Overall Confidence */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Overall Confidence</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getConfidenceColor(editedData.confidence.overall)}`}>
                      {getConfidenceLabel(editedData.confidence.overall)} ({Math.round(editedData.confidence.overall * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Applicant Name</label>
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getConfidenceColor(editedData.confidence.name)}`}>
                      {Math.round(editedData.confidence.name * 100)}%
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editedData.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Not found"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Email</label>
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getConfidenceColor(editedData.confidence.email)}`}>
                      {Math.round(editedData.confidence.email * 100)}%
                    </span>
                  </div>
                  <input
                    type="email"
                    value={editedData.email || ''}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Not found"
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Phone</label>
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getConfidenceColor(editedData.confidence.phone)}`}>
                      {Math.round(editedData.confidence.phone * 100)}%
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={editedData.phone || ''}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Not found"
                  />
                </div>

                {/* Move-in Date Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Move-in Date</label>
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getConfidenceColor(editedData.confidence.moveInDate)}`}>
                      {Math.round(editedData.confidence.moveInDate * 100)}%
                    </span>
                  </div>
                  <input
                    type="text"
                    value={editedData.moveInDate || ''}
                    onChange={(e) => handleFieldChange('moveInDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MM/DD/YYYY"
                  />
                </div>

                {/* Application Date Field */}
                {editedData.createdAt !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Application Date</label>
                      {editedData.confidence.createdAt !== undefined && (
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${getConfidenceColor(editedData.confidence.createdAt)}`}>
                          {Math.round(editedData.confidence.createdAt * 100)}%
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editedData.createdAt || ''}
                      onChange={(e) => handleFieldChange('createdAt', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                )}

                {/* Property Field */}
                {editedData.property !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Property</label>
                      {editedData.confidence.property !== undefined && (
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${getConfidenceColor(editedData.confidence.property)}`}>
                          {Math.round(editedData.confidence.property * 100)}%
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editedData.property || ''}
                      onChange={(e) => handleFieldChange('property', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Not found"
                    />
                  </div>
                )}

                {/* Rent Field */}
                {editedData.rent !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Rent</label>
                      {editedData.confidence.rent !== undefined && (
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${getConfidenceColor(editedData.confidence.rent)}`}>
                          {Math.round(editedData.confidence.rent * 100)}%
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editedData.rent || ''}
                      onChange={(e) => handleFieldChange('rent', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Not found"
                    />
                  </div>
                )}

                {/* Unit Number Field */}
                {editedData.unitNumber !== undefined && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-gray-700">Unit Number</label>
                      {editedData.confidence.unitNumber !== undefined && (
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${getConfidenceColor(editedData.confidence.unitNumber)}`}>
                          {Math.round(editedData.confidence.unitNumber * 100)}%
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={editedData.unitNumber || ''}
                      onChange={(e) => handleFieldChange('unitNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Not found"
                    />
                  </div>
                )}

                {/* Info Message */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-6">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Review & Edit</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Please review the extracted data and make any necessary corrections before using it.
                        Confidence scores indicate extraction accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUseData}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Use This Data
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
