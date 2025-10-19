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
      className={`text-base text-gray-900 bg-transparent border-none outline-none w-full ${className}`}
    />
  )
}
