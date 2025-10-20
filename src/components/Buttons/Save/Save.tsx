import Image from 'next/image'

interface SaveButtonProps {
  onClick: () => void
  disabled?: boolean
}

export default function Save({ onClick, disabled = false }: SaveButtonProps) {
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
