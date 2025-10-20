import Image from 'next/image'

/**
 * SaveButton Component
 *
 * A reusable save button with an icon. Displays a check circle icon.
 *
 * @example
 * ```tsx
 * <SaveButton onClick={handleSave} disabled={isSaving} />
 * ```
 *
 * To adapt for new projects:
 * 1. Replace /check-circle.svg with your own icon path
 * 2. Adjust size (w-8 h-8) as needed
 * 3. Customize disabled styles (opacity-50 cursor-not-allowed)
 */

interface SaveButtonProps {
  onClick: () => void
  disabled?: boolean
}

export default function SaveButton({ onClick, disabled = false }: SaveButtonProps) {
  return (
    <Image
      src="/check-circle.svg"
      alt="Save"
      width={32}
      height={32}
      onClick={disabled ? undefined : onClick}
      className={`w-8 h-8 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    />
  )
}
