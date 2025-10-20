import Image from 'next/image'

/**
 * CancelButton Component
 *
 * A reusable cancel button with an icon. Displays a close circle icon.
 *
 * @example
 * ```tsx
 * <CancelButton onClick={handleCancel} />
 * ```
 *
 * To adapt for new projects:
 * 1. Replace /close-circle.svg with your own icon path
 * 2. Adjust size (w-8 h-8) as needed
 * 3. Customize hover/active states
 */

interface CancelButtonProps {
  onClick: () => void
}

export default function CancelButton({ onClick }: CancelButtonProps) {
  return (
    <Image
      src="/close-circle.svg"
      alt="Cancel"
      width={32}
      height={32}
      onClick={onClick}
      className="w-8 h-8 cursor-pointer"
    />
  )
}
