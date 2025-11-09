/**
 * OptimisticFieldExample Component
 *
 * A complete working example showing how to implement optimistic UI updates
 * for Application financial fields. Use this as a reference when implementing
 * optimistic updates in other components.
 *
 * This component demonstrates:
 * - Instant field updates (like Notion/Linear)
 * - Debounced auto-save (500ms after typing stops)
 * - Error handling with retry/cancel modal
 * - Automatic revert on error
 *
 * To use this pattern in ApplicationDetailForm or other components:
 * 1. Import the useOptimisticApplicationField hook
 * 2. Replace useState with the hook
 * 3. Connect to InlineTextField onChange
 * 4. Add ErrorModal for error handling
 *
 * @example
 * ```tsx
 * // In ApplicationDetailForm.tsx:
 * import { useOptimisticApplicationField } from '@/hooks/useOptimisticApplicationField'
 * import ErrorModal from '@/components/ErrorModal'
 *
 * // Replace this:
 * const [rent, setRent] = useState(application.rent)
 *
 * // With this:
 * const [showErrorModal, setShowErrorModal] = useState(false)
 * const { value: rent, update: updateRent, error } = useOptimisticApplicationField({
 *   applicationId,
 *   fieldName: 'rent',
 *   initialValue: application.rent || '',
 *   debounceMs: 500,
 *   onError: () => setShowErrorModal(true)
 * })
 *
 * // In your JSX, replace:
 * <InlineTextField value={rent} onChange={(v) => setRent(v)} />
 *
 * // With:
 * <InlineTextField value={rent} onChange={updateRent} />
 *
 * // Add error modal:
 * <ErrorModal
 *   isOpen={showErrorModal}
 *   title="Failed to Save"
 *   message={error?.message || 'Could not save changes'}
 *   onRetry={() => {
 *     updateRent(rent)
 *     setShowErrorModal(false)
 *   }}
 *   onCancel={() => setShowErrorModal(false)}
 * />
 * ```
 */

'use client'

import { useState, useEffect } from 'react'
import InlineTextField from '@/components/InlineTextField'
import ErrorModal from '@/components/ErrorModal'
import { useOptimisticApplicationField } from '@/hooks/useOptimisticApplicationField'

interface OptimisticFieldExampleProps {
  applicationId: number
  initialRent: string
  initialDeposit: string
}

export default function OptimisticFieldExample({
  applicationId,
  initialRent,
  initialDeposit,
}: OptimisticFieldExampleProps) {
  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorField, setErrorField] = useState<string>('')

  // Optimistic rent field
  const {
    value: rent,
    update: updateRent,
    isUpdating: isRentUpdating,
    error: rentError,
  } = useOptimisticApplicationField({
    applicationId,
    fieldName: 'rent',
    initialValue: initialRent,
    debounceMs: 500, // Auto-saves 500ms after user stops typing
    onSuccess: () => {
      console.log('✅ Rent saved successfully!')
    },
    onError: (err) => {
      console.error('❌ Failed to save rent:', err.message)
      setErrorField('rent')
      setShowErrorModal(true)
    },
  })

  // Optimistic deposit field
  const {
    value: deposit,
    update: updateDeposit,
    isUpdating: isDepositUpdating,
    error: depositError,
  } = useOptimisticApplicationField({
    applicationId,
    fieldName: 'deposit',
    initialValue: initialDeposit,
    debounceMs: 500,
    onSuccess: () => {
      console.log('✅ Deposit saved successfully!')
    },
    onError: (err) => {
      console.error('❌ Failed to save deposit:', err.message)
      setErrorField('deposit')
      setShowErrorModal(true)
    },
  })

  // Get current error based on which field failed
  const currentError = errorField === 'rent' ? rentError : depositError
  const retryUpdate = errorField === 'rent' ? updateRent : updateDeposit
  const currentValue = errorField === 'rent' ? rent : deposit

  return (
    <div className="space-y-4">
      {/* Rent Field - Updates instantly as user types */}
      <div>
        <InlineTextField
          label="Monthly Rent"
          value={rent}
          onChange={updateRent}
          placeholder="$0.00"
          type="text"
        />
        {isRentUpdating && (
          <p className="text-xs text-gray-500 mt-1">Saving...</p>
        )}
      </div>

      {/* Deposit Field - Updates instantly as user types */}
      <div>
        <InlineTextField
          label="Security Deposit"
          value={deposit}
          onChange={updateDeposit}
          placeholder="$0.00"
          type="text"
        />
        {isDepositUpdating && (
          <p className="text-xs text-gray-500 mt-1">Saving...</p>
        )}
      </div>

      {/* Error Modal - Shows if save fails */}
      <ErrorModal
        isOpen={showErrorModal}
        title="Failed to Save"
        message={
          currentError?.message ||
          'Could not save your changes. Please check your internet connection and try again.'
        }
        onRetry={() => {
          // Retry saving with current value
          retryUpdate(currentValue)
          setShowErrorModal(false)
        }}
        onCancel={() => {
          // Cancel - hook automatically reverts to last saved value
          setShowErrorModal(false)
        }}
      />

      {/* Implementation Notes */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">
          How This Works:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Type in a field → UI updates INSTANTLY (no waiting)</li>
          <li>After you stop typing for 500ms → auto-saves to server</li>
          <li>If save succeeds → ✅ done (you won't notice anything)</li>
          <li>If save fails → ❌ error modal appears</li>
          <li>Click "Retry" → tries to save again</li>
          <li>Click "Cancel" → reverts to last successfully saved value</li>
        </ul>

        <div className="mt-4 p-3 bg-white rounded border border-blue-300">
          <p className="text-xs font-mono text-gray-700">
            <strong>Test error handling:</strong><br />
            1. Open DevTools → Network tab<br />
            2. Set to "Offline" mode<br />
            3. Edit a field → see instant update<br />
            4. Wait 3 seconds → error modal appears<br />
            5. Turn network back on → click "Retry" → saves!
          </p>
        </div>
      </div>
    </div>
  )
}
