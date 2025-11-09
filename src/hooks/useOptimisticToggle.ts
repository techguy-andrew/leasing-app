/**
 * useOptimisticToggle hook
 *
 * For TOGGLE operations - optimistically toggles a boolean value immediately,
 * then reverts if the server operation fails.
 *
 * Pattern (similar to TasksList completion toggle):
 * 1. Toggle UI state immediately (feels instant)
 * 2. Send API request in background
 * 3. On success: Confirm with server data
 * 4. On error: Revert to original value + show error
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { getErrorMessage, getAPIErrorMessage } from '@/lib/errorMessages'

export interface UseOptimisticToggleOptions {
  apiEndpoint: string
  method?: 'PUT' | 'PATCH'
  fieldName?: string
  onSuccess?: (newValue: boolean) => void
  onError?: (error: Error) => void
  getPayload?: (value: boolean) => Record<string, unknown>
}

export interface UseOptimisticToggleReturn {
  value: boolean
  toggle: (newValue?: boolean) => Promise<void>
  isToggling: boolean
  error: Error | null
  reset: () => void
}

export function useOptimisticToggle(
  initialValue: boolean,
  options: UseOptimisticToggleOptions
): UseOptimisticToggleReturn {
  const {
    apiEndpoint,
    method = 'PATCH',
    fieldName,
    onSuccess,
    onError,
    getPayload,
  } = options

  const [value, setValue] = useState(initialValue)
  const [isToggling, setIsToggling] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const originalValueRef = useRef(initialValue)

  // Update original value when prop changes
  useEffect(() => {
    originalValueRef.current = initialValue
    setValue(initialValue)
  }, [initialValue])

  const toggle = useCallback(
    async (newValue?: boolean) => {
      const targetValue = newValue !== undefined ? newValue : !value

      // Optimistic toggle - immediate UI change
      setValue(targetValue)
      setIsToggling(true)
      setError(null)

      try {
        const payload = getPayload
          ? getPayload(targetValue)
          : fieldName
          ? { [fieldName]: targetValue }
          : { value: targetValue }

        const response = await fetch(apiEndpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorMessage = getAPIErrorMessage(response)
          throw new Error(errorMessage)
        }

        const data = await response.json()

        // Confirm with server data if available
        if (data.data !== undefined && typeof data.data === 'object') {
          const serverValue = fieldName ? data.data[fieldName] : data.data.value
          if (typeof serverValue === 'boolean') {
            setValue(serverValue)
            originalValueRef.current = serverValue
          } else {
            originalValueRef.current = targetValue
          }
        } else {
          originalValueRef.current = targetValue
        }

        onSuccess?.(targetValue)
      } catch (err) {
        const errorObj = new Error(getErrorMessage(err))
        setError(errorObj)

        // Revert to original value
        setValue(originalValueRef.current)

        onError?.(errorObj)
      } finally {
        setIsToggling(false)
      }
    },
    [value, apiEndpoint, method, fieldName, getPayload, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setValue(originalValueRef.current)
    setError(null)
    setIsToggling(false)
  }, [])

  return {
    value,
    toggle,
    isToggling,
    error,
    reset,
  }
}
