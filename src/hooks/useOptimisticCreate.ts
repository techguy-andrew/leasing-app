/**
 * useOptimisticCreate hook
 *
 * For CREATE operations - optimistically adds a new item to a list immediately,
 * then replaces the temporary ID with the server-generated ID.
 *
 * Pattern:
 * 1. Add item to list with temporary ID (feels instant)
 * 2. Send API request in background
 * 3. On success: Replace temp ID with real ID from server
 * 4. On error: Remove temp item + show error
 */

import { useState, useCallback } from 'react'
import { getErrorMessage, getAPIErrorMessage } from '@/lib/errorMessages'
import { generateTempId } from '@/lib/tempId'

export interface UseOptimisticCreateOptions<T> {
  apiEndpoint: string
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export interface UseOptimisticCreateReturn<T> {
  create: (newItem: Partial<T>) => Promise<T | null>
  isCreating: boolean
  error: Error | null
}

export function useOptimisticCreate<T extends { id: string | number }>(
  options: UseOptimisticCreateOptions<T>
): UseOptimisticCreateReturn<T> {
  const { apiEndpoint, onSuccess, onError } = options

  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const create = useCallback(
    async (newItem: Partial<T>): Promise<T | null> => {
      setIsCreating(true)
      setError(null)

      const tempId = generateTempId()
      const optimisticItem = {
        ...newItem,
        id: tempId,
      } as T

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        })

        if (!response.ok) {
          const errorMessage = getAPIErrorMessage(response)
          throw new Error(errorMessage)
        }

        const data = await response.json()
        const serverItem = data.data as T

        onSuccess?.(serverItem)

        return serverItem
      } catch (err) {
        const errorObj = new Error(getErrorMessage(err))
        setError(errorObj)
        onError?.(errorObj)
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [apiEndpoint, onSuccess, onError]
  )

  return {
    create,
    isCreating,
    error,
  }
}
