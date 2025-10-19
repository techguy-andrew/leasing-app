'use client'

interface InlineTextFieldProps {
  value: string
  onChange: (value: string) => void
  isEditMode: boolean
  placeholder?: string
  type?: string
  className?: string
}

export default function InlineTextField({
  value,
  onChange,
  isEditMode,
  placeholder = '',
  type = 'text',
  className = ''
}: InlineTextFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  if (!isEditMode) {
    return (
      <span className={`text-base text-gray-900 ${className}`}>
        {value || 'N/A'}
      </span>
    )
  }

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={`text-base text-gray-900 bg-transparent border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none transition-colors duration-150 px-0 py-1 w-full ${className}`}
    />
  )
}
