'use client'

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'

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
  type?: 'text' | 'number'
  formatType?: 'text' | 'phone' | 'currency'
}

const InlineTextField = forwardRef<HTMLDivElement, InlineTextFieldProps>(function InlineTextField({
  value,
  onChange,
  isEditMode,
  placeholder = '',
  className = '',
  onEnterPress,
  prefix,
  type = 'text',
  formatType = 'text'
}, ref) {
  const contentRef = useRef<HTMLDivElement>(null)
  const isTypingRef = useRef(false)
  const lastValueRef = useRef<string>(value)
  const prevEditModeRef = useRef(isEditMode)

  // Track if field has content (for placeholder visibility)
  const [hasContent, setHasContent] = useState(value.length > 0)

  // Expose the contentRef to parent components via ref
  useImperativeHandle(ref, () => contentRef.current as HTMLDivElement, [])

  // Format currency with fixed decimal point and thousand separators - inline as user types
  const formatCurrency = (rawValue: string): string => {
    const digitsOnly = rawValue.replace(/\D/g, '')
    if (digitsOnly === '') return ''
    const paddedCents = digitsOnly.padStart(3, '0')
    const dollars = paddedCents.slice(0, -2)
    const cents = paddedCents.slice(-2)

    // Remove leading zeros and add thousand separators (e.g., 1234 -> 1,234)
    const dollarsAsNumber = parseInt(dollars, 10)
    const formattedDollars = dollarsAsNumber.toLocaleString('en-US')

    return `${formattedDollars}.${cents}`
  }

  // Format phone with dashes - inline as user types
  const formatPhone = (rawValue: string): string => {
    const digitsOnly = rawValue.replace(/\D/g, '')
    if (digitsOnly.length <= 3) return digitsOnly
    if (digitsOnly.length <= 6) return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`
  }

  // Apply formatting based on formatType
  const applyFormatting = (rawValue: string): string => {
    if (formatType === 'currency') return formatCurrency(rawValue)
    if (formatType === 'phone') return formatPhone(rawValue)
    return rawValue
  }

  // Initialize content when entering edit mode
  useEffect(() => {
    if (isEditMode && !prevEditModeRef.current && contentRef.current) {
      contentRef.current.textContent = value || ''
      lastValueRef.current = value
    }
    prevEditModeRef.current = isEditMode
  }, [isEditMode, value])

  // Only update DOM when value changes externally (not during user typing)
  useEffect(() => {
    // Don't interfere while user is actively typing
    if (isTypingRef.current) return

    if (!isEditMode || !contentRef.current) return

    const displayValue = value || ''

    // Update hasContent state for placeholder visibility
    setHasContent(displayValue.length > 0)

    // Only update if value actually changed and different from DOM content
    if (displayValue !== lastValueRef.current && contentRef.current.textContent !== displayValue) {
      const hadFocus = document.activeElement === contentRef.current

      // Save cursor position
      let cursorPos = 0
      if (hadFocus) {
        const selection = window.getSelection()
        if (selection?.rangeCount) {
          cursorPos = selection.getRangeAt(0).startOffset
        }
      }

      // Update content
      contentRef.current.textContent = displayValue
      lastValueRef.current = displayValue

      // Restore cursor position for formatted fields
      if (hadFocus && contentRef.current.firstChild) {
        try {
          const selection = window.getSelection()
          const range = document.createRange()
          const textNode = contentRef.current.firstChild
          const textLength = textNode.textContent?.length ?? 0

          // For number fields, place cursor at end
          const newPos = type === 'number' ? textLength : Math.min(cursorPos, textLength)

          range.setStart(textNode, newPos)
          range.collapse(true)
          selection?.removeAllRanges()
          selection?.addRange(range)
        } catch {
          // Ignore cursor restoration errors
        }
      }
    }
  }, [value, isEditMode, type])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    isTypingRef.current = true

    const rawValue = e.currentTarget.textContent || ''

    // Apply formatting IMMEDIATELY before state update
    const formattedValue = applyFormatting(rawValue)

    // Update DOM with formatted value and restore cursor
    if (formattedValue !== rawValue && contentRef.current) {
      const selection = window.getSelection()

      // For currency and phone, always keep cursor at end for natural typing
      const newCursorPos = formattedValue.length

      contentRef.current.textContent = formattedValue

      // Restore cursor position
      if (contentRef.current.firstChild) {
        try {
          const range = document.createRange()
          const textNode = contentRef.current.firstChild
          const safePos = Math.min(newCursorPos, textNode.textContent?.length ?? 0)
          range.setStart(textNode, safePos)
          range.collapse(true)
          selection?.removeAllRanges()
          selection?.addRange(range)
        } catch {
          // Ignore cursor restoration errors
        }
      }
    }

    lastValueRef.current = formattedValue
    onChange(formattedValue)

    // Update hasContent for immediate placeholder hide
    setHasContent(formattedValue.length > 0)

    // Reset typing flag after formatting has happened
    setTimeout(() => {
      isTypingRef.current = false
    }, 50)
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!isEditMode) return

    // Prevent default paste behavior that preserves formatting
    e.preventDefault()

    // Extract plain text from clipboard
    const plainText = e.clipboardData.getData('text/plain')

    // If there's no text, do nothing
    if (!plainText) return

    // Mark as typing to prevent DOM updates during paste
    isTypingRef.current = true

    // Apply formatting to pasted text immediately
    const formattedText = applyFormatting(plainText)

    // Insert formatted text at cursor position
    document.execCommand('insertText', false, formattedText)

    // Reset typing flag after paste
    setTimeout(() => {
      isTypingRef.current = false
    }, 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent line breaks in contentEditable
      if (onEnterPress) {
        onEnterPress()
      }
      return
    }

    // For number type, only allow digits
    if (type === 'number') {
      // Allow: backspace, delete, tab, escape, enter, arrows
      if (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'Tab' ||
        e.key === 'Escape' ||
        e.key === 'Enter' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'Home' ||
        e.key === 'End' ||
        // Allow Ctrl/Cmd + A, C, V, X
        ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
      ) {
        return
      }

      // Prevent non-numeric characters
      if (!/^\d$/.test(e.key)) {
        e.preventDefault()
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
            {!hasContent && placeholder && (
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
              className={`text-base sm:text-lg font-sans bg-transparent outline-none cursor-text select-text text-gray-900 ${!hasContent ? 'min-h-[1.5rem]' : ''} ${className}`}
            />
          </>
        ) : (
          <div className={`text-base sm:text-lg font-sans cursor-text select-text ${value === '' ? 'text-gray-400' : 'text-gray-900'}`}>
            {value || placeholder}
          </div>
        )}
      </div>
    </div>
  )
})

export default InlineTextField
