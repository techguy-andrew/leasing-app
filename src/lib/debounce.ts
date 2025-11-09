/**
 * Debounce utility for delaying function execution
 * Useful for optimistic updates on rapid user input (e.g., typing)
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function debouncedFunction(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<void> {
  let timeoutId: NodeJS.Timeout | null = null
  let latestPromise: Promise<void> = Promise.resolve()

  return function debouncedAsyncFunction(...args: Parameters<T>): Promise<void> {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    latestPromise = new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        await func(...args)
        resolve()
      }, wait)
    })

    return latestPromise
  }
}
