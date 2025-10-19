interface CancelButtonProps {
  onClick: () => void
}

export default function Cancel({ onClick }: CancelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center p-1.5 text-gray-600 bg-white border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-colors"
      aria-label="Cancel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}
