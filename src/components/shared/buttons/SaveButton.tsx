import IconPack from '@/components/shared/icons/IconPack'

/**
 * SaveButton Component
 *
 * A reusable save button with an icon. Displays a check circle icon.
 * Uses standardized IconPack with consistent hover animation (scale-110).
 *
 * @example
 * ```tsx
 * <SaveButton onClick={handleSave} disabled={isSaving} />
 * ```
 *
 * To adapt for new projects:
 * 1. Adjust size as needed ('small' | 'default' | 'large')
 * 2. Customize disabled behavior
 */

interface SaveButtonProps {
  onClick: () => void
  disabled?: boolean
  size?: 'small' | 'default' | 'large'
}

export default function SaveButton({ onClick, disabled = false, size = 'large' }: SaveButtonProps) {
  return (
    <IconPack.Save
      onClick={onClick}
      disabled={disabled}
      size={size}
    />
  )
}
