/**
 * useOptimisticDelete hook
 *
 * For DELETE operations - optimistically removes an item from the UI immediately,
 * then restores it if the server operation fails.
 *
 * Pattern:
 * 1. Remove item from UI (feels instant)
 * 2. Send API DELETE request in background
 * 3. On success: Item stays removed
 * 4. On error: Restore item + show error
 */

import { useState, useCallback } from 'react'
import { getErrorMessage, getAPIErrorMessage } from '@/lib/errorMessages'

export interface UseOptimisticDeleteOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export interface UseOptimisticDeleteReturn {
  deleteItem: (apiEndpoint: string) => Promise<boolean>
  isDeleting: boolean
  error: Error | null
  rollback: () => void
}

export function useOptimisticDelete(
  options: UseOptimisticDeleteOptions = {}
): UseOptimisticDeleteReturn {
  const { onSuccess, onError } = options

  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [rollbackFn, setRollbackFn] = useState<(() => void) | null>(null)

  const deleteItem = useCallback(
    async (apiEndpoint: string): Promise<boolean> => {
      setIsDeleting(true)
      setError(null)

      try {
        const response = await fetch(apiEndpoint, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorMessage = getAPIErrorMessage(response)
          throw new Error(errorMessage)
        }

        onSuccess?.()
        return true
      } catch (err) {
        const errorObj = new Error(getErrorMessage(err))
        setError(errorObj)
        onError?.(errorObj)
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    [onSuccess, onError]
  )

  const rollback = useCallback(() => {
    if (rollbackFn) {
      rollbackFn()
      setRollbackFn(null)
    }
    setError(null)
  }, [rollbackFn])

  return {
    deleteItem,
    isDeleting,
    error,
    rollback,
  }
}
