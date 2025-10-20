import Image from 'next/image'

interface CancelButtonProps {
  onClick: () => void
}

export default function Cancel({ onClick }: CancelButtonProps) {
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
