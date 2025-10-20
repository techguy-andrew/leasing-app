import IconPack from '@/components/shared/icons/IconPack'

/**
 * CancelButton Component
 *
 * A reusable cancel button with an icon. Displays a close circle icon.
 * Uses standardized IconPack with consistent hover animation (scale-110).
 *
 * @example
 * ```tsx
 * <CancelButton onClick={handleCancel} />
 * ```
 *
 * To adapt for new projects:
 * 1. Adjust size as needed ('small' | 'default' | 'large')
 * 2. Customize behavior
 */

interface CancelButtonProps {
  onClick: () => void
  size?: 'small' | 'default' | 'large'
}

export default function CancelButton({ onClick, size = 'large' }: CancelButtonProps) {
  return (
    <IconPack.Cancel
      onClick={onClick}
      size={size}
    />
  )
}
