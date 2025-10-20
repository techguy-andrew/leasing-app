'use client'

import { useRef, useEffect } from 'react'

interface MinimalInlineTextFieldProps {
  value: string
  onChange: (value: string) => void
  isEditMode: boolean
  placeholder?: string
  className?: string
}

export default function MinimalInlineTextField({
  value,
  onChange,
  isEditMode,
  placeholder = '',
  className = ''
}: MinimalInlineTextFieldProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const cursorPositionRef = useRef<number | null>(null)
  const previousValueRef = useRef<string>('')

  // Update contentEditable when value changes externally
  useEffect(() => {
    const displayValue = value || (!isEditMode ? 'N/A' : '')
    if (contentRef.current && contentRef.current.textContent !== displayValue) {
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

      // Restore cursor position (only in edit mode and if we had focus)
      if (isEditMode && hadFocus && targetCursorPos !== null && contentRef.current.firstChild) {
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
    if (!isEditMode) return

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

  return (
    <div className="relative">
      {isEditMode && value === '' && (
        <div className="absolute inset-0 text-base sm:text-lg text-gray-400 font-sans pointer-events-none">
          {placeholder}
        </div>
      )}
      <div
        ref={contentRef}
        contentEditable={isEditMode}
        suppressContentEditableWarning
        onInput={handleInput}
        className={`text-base sm:text-lg text-gray-900 font-sans bg-transparent outline-none ${isEditMode ? 'cursor-text' : 'cursor-text select-text'} ${className}`}
      />
    </div>
  )
}
