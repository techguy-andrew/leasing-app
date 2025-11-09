/**
 * Temporary ID utilities for optimistic UI updates
 * Used to assign temporary IDs to new records before server confirmation
 */

export function generateTempId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  return `temp-${timestamp}-${random}`
}

export function isTempId(id: string | number): boolean {
  return typeof id === 'string' && id.startsWith('temp-')
}

export function extractTempId(id: string | number): string | null {
  if (isTempId(id)) {
    return String(id)
  }
  return null
}
