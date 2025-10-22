'use client'

import { useRef, useEffect } from 'react'

/**
 * InlineTextField Component
 *
 * A sophisticated inline editable text field with cursor position preservation
 * and automatic formatting support. Displays as plain text when not in edit mode.
 *
 * Features:
 * - Strips all formatting from pasted content (bold, italic, colors, highlights, etc.)
 * - Ensures pasted text adopts the application's default typography
 * - Preserves cursor position during editing and formatting
 * - Supports automatic value formatting (dates, phone numbers, currency)
 *
 * @example
 * ```tsx
 * <InlineTextField
 *   value={formData.applicant}
 *   onChange={(value) => setFormData({ ...formData, applicant: value })}
 *   isEditMode={isEditMode}
 *   placeholder="Enter name"
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Use as-is for any inline text editing needs
 * 2. Displays "N/A" when value is empty and not in edit mode
 * 3. Supports formatted values (e.g., dates, phone numbers) with cursor preservation
 * 4. Customize placeholder and className as needed
 * 5. Works seamlessly with formatDate/formatPhone functions
 * 6. Automatically strips all formatting from pasted content
 */

interface InlineTextFieldProps {
  value: string
  onChange: (value: string) => void
  isEditMode: boolean
  placeholder?: string
  className?: string
  onEnterPress?: () => void
  prefix?: string
}

export default function InlineTextField({
  value,
  onChange,
  isEditMode,
  placeholder = '',
  className = '',
  onEnterPress,
  prefix
}: InlineTextFieldProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const cursorPositionRef = useRef<number | null>(null)
  const previousValueRef = useRef<string>('')

  // Update contentEditable when value changes externally
  useEffect(() => {
    if (!isEditMode || !contentRef.current) return

    const displayValue = value || ''
    if (contentRef.current.textContent !== displayValue) {
      const selection = window.getSelection()
      const hadFocus = document.activeElement === contentRef.current

      // Get saved cursor position
      let targetCursorPos = cursorPositionRef.current

      // If we don't have a saved position, try to get current position
      if (targetCursorPos === null && hadFocus && selection?.rangeCount) {
        const range = selection.getRangeAt(0)
        targetCursorPos = range.startOffset
      }

      // If we have a saved cursor position and the value changed due to formatting
      // (e.g., date formatting added slashes), we need to intelligently reposition
      if (targetCursorPos !== null && contentRef.current.textContent !== displayValue) {
        const oldValue = contentRef.current.textContent || ''
        const newValue = displayValue

        // Count non-formatting characters (digits) before cursor in old value
        let digitsBeforeCursor = 0
        for (let i = 0; i < Math.min(targetCursorPos, oldValue.length); i++) {
          if (/\d/.test(oldValue[i])) {
            digitsBeforeCursor++
          }
        }

        // Find position in new value after same number of digits
        let newCursorPos = 0
        let digitCount = 0
        for (let i = 0; i < newValue.length; i++) {
          if (/\d/.test(newValue[i])) {
            digitCount++
            if (digitCount > digitsBeforeCursor) {
              newCursorPos = i
              break
            }
          }
          if (digitCount === digitsBeforeCursor) {
            newCursorPos = i + 1
          }
        }

        // If we've counted all digits we need, use that position
        if (digitCount >= digitsBeforeCursor) {
          targetCursorPos = newCursorPos
        } else {
          // Otherwise, place cursor at end
          targetCursorPos = newValue.length
        }
      }

      // Update the content
      contentRef.current.textContent = displayValue
      previousValueRef.current = displayValue

      // Restore cursor position (only if we had focus)
      if (hadFocus && targetCursorPos !== null && contentRef.current.firstChild) {
        try {
          const newRange = document.createRange()
          const textNode = contentRef.current.firstChild
          const textLength = textNode.textContent?.length ?? 0

          // Ensure cursor position is valid
          const newOffset = Math.min(Math.max(0, targetCursorPos), textLength)

          newRange.setStart(textNode, newOffset)
          newRange.collapse(true)
          selection?.removeAllRanges()
          selection?.addRange(newRange)
        } catch {
          // Cursor restoration failed, that's ok
        }
      }

      // Clear saved cursor position after use
      cursorPositionRef.current = null
    }
  }, [value, isEditMode])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Get cursor position BEFORE onChange is called
    const selection = window.getSelection()
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0)
      // Save cursor position for restoration after formatting
      cursorPositionRef.current = range.startOffset
    }

    const newValue = e.currentTarget.textContent || ''
    onChange(newValue)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!isEditMode) return

    // Prevent default paste behavior that preserves formatting
    e.preventDefault()

    // Extract plain text from clipboard
    const plainText = e.clipboardData.getData('text/plain')

    // If there's no text, do nothing
    if (!plainText) return

    // Insert plain text at cursor position
    // Using execCommand for better browser support and cursor handling
    document.execCommand('insertText', false, plainText)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isEditMode) return

    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent line breaks in contentEditable
      if (onEnterPress) {
        onEnterPress()
      }
    }
  }

  return (
    <div className="relative flex items-baseline">
      {prefix && (
        <span className={`text-base sm:text-lg font-sans mr-1 ${value === '' ? 'text-gray-400' : 'text-gray-900'}`}>
          {prefix}
        </span>
      )}
      <div className="relative flex-1">
        {isEditMode ? (
          <>
            {value === '' && placeholder && (
              <div className="absolute inset-0 text-base sm:text-lg text-gray-400 font-sans pointer-events-none">
                {placeholder}
              </div>
            )}
            <div
              ref={contentRef}
              contentEditable={true}
              suppressContentEditableWarning
              onInput={handleInput}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              className={`text-base sm:text-lg font-sans bg-transparent outline-none cursor-text select-text text-gray-900 ${value === '' ? 'min-h-[1.5rem]' : ''} ${className}`}
            >
              {value}
            </div>
          </>
        ) : (
          <div className={`text-base sm:text-lg font-sans cursor-text select-text ${value === '' ? 'text-gray-400' : 'text-gray-900'}`}>
            {value || placeholder}
          </div>
        )}
      </div>
    </div>
  )
}
