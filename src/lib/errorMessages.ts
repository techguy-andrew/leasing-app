/**
 * Error message formatting utilities
 * Provides consistent error message extraction across the application
 */

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'An unexpected error occurred. Please try again.'
}

export function getAPIErrorMessage(response: Response, fallback?: string): string {
  const statusMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'You are not authorized to perform this action.',
    403: 'Access forbidden.',
    404: 'The requested resource was not found.',
    409: 'This operation conflicts with existing data.',
    422: 'Validation error. Please check your input.',
    500: 'Server error. Please try again later.',
    503: 'Service temporarily unavailable.',
  }

  return statusMessages[response.status] || fallback || 'An error occurred while processing your request.'
}
