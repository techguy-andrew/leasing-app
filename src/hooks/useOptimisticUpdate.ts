/**
 * useOptimisticUpdate hook
 *
 * For UPDATE operations - optimistically updates a value immediately,
 * then synchronizes with the server in the background.
 *
 * Pattern (based on TasksList.tsx):
 * 1. Update UI state immediately (feels instant)
 * 2. Send API request in background
 * 3. On success: Confirm with server data
 * 4. On error: Revert to original value + show error
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { getErrorMessage, getAPIErrorMessage } from '@/lib/errorMessages'
import { debounceAsync } from '@/lib/debounce'

export interface UseOptimisticUpdateOptions<T> {
  apiEndpoint: string
  method?: 'PUT' | 'PATCH'
  debounceMs?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  getPayload?: (value: T) => Record<string, unknown>
}

export interface UseOptimisticUpdateReturn<T> {
  value: T
  update: (newValue: T) => Promise<void>
  isUpdating: boolean
  error: Error | null
  reset: () => void
}

export function useOptimisticUpdate<T>(
  initialValue: T,
  options: UseOptimisticUpdateOptions<T>
): UseOptimisticUpdateReturn<T> {
  const {
    apiEndpoint,
    method = 'PUT',
    debounceMs = 0,
    onSuccess,
    onError,
    getPayload,
  } = options

  const [value, setValue] = useState<T>(initialValue)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const originalValueRef = useRef<T>(initialValue)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Update original value when prop changes
  useEffect(() => {
    originalValueRef.current = initialValue
    setValue(initialValue)
  }, [initialValue])

  const performUpdate = useCallback(
    async (newValue: T) => {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setIsUpdating(true)
      setError(null)

      try {
        const payload = getPayload ? getPayload(newValue) : newValue

        const response = await fetch(apiEndpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorMessage = getAPIErrorMessage(response)
          throw new Error(errorMessage)
        }

        const data = await response.json()

        // Confirm with server data
        if (data.data !== undefined) {
          setValue(data.data)
          originalValueRef.current = data.data
        } else {
          originalValueRef.current = newValue
        }

        onSuccess?.(data.data || newValue)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, ignore
          return
        }

        const errorObj = new Error(getErrorMessage(err))
        setError(errorObj)

        // Revert to original value
        setValue(originalValueRef.current)

        onError?.(errorObj)
      } finally {
        setIsUpdating(false)
        abortControllerRef.current = null
      }
    },
    [apiEndpoint, method, getPayload, onSuccess, onError]
  )

  // Debounced version if needed
  const debouncedUpdate = useRef(
    debounceMs > 0 ? debounceAsync(performUpdate, debounceMs) : performUpdate
  ).current

  const update = useCallback(
    async (newValue: T) => {
      // Optimistic update - immediate UI change
      setValue(newValue)

      // Perform API call (debounced if configured)
      await debouncedUpdate(newValue)
    },
    [debouncedUpdate]
  )

  const reset = useCallback(() => {
    setValue(originalValueRef.current)
    setError(null)
    setIsUpdating(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    value,
    update,
    isUpdating,
    error,
    reset,
  }
}
