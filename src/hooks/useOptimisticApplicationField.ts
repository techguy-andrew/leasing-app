/**
 * useOptimisticApplicationField
 *
 * Specialized hook for Application financial and text field updates.
 * Makes edits feel instant like Notion/Linear - UI updates immediately,
 * server synchronization happens in the background.
 *
 * Usage:
 * ```tsx
 * const { value, update, isUpdating, error } = useOptimisticApplicationField({
 *   applicationId: 123,
 *   fieldName: 'rent',
 *   initialValue: application.rent || '',
 *   debounceMs: 500, // Wait 500ms after typing stops
 *   onError: (err) => setShowErrorModal(true)
 * })
 *
 * // In your component:
 * <InlineTextField
 *   value={value}
 *   onChange={(newValue) => update(newValue)}
 *   // ... other props
 * />
 * ```
 */

import { useOptimisticUpdate, UseOptimisticUpdateOptions } from './useOptimisticUpdate'

interface UseOptimisticApplicationFieldOptions {
  applicationId: number
  fieldName: string
  initialValue: string
  debounceMs?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useOptimisticApplicationField({
  applicationId,
  fieldName,
  initialValue,
  debounceMs = 500,
  onSuccess,
  onError,
}: UseOptimisticApplicationFieldOptions) {
  const options: UseOptimisticUpdateOptions<string> = {
    apiEndpoint: `/api/applications/${applicationId}`,
    method: 'PUT',
    debounceMs,
    onSuccess,
    onError,
    getPayload: (value) => ({
      [fieldName]: value,
    }),
  }

  return useOptimisticUpdate<string>(initialValue, options)
}
