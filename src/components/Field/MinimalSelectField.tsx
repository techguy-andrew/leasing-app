'use client'

interface MinimalSelectFieldProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
  error?: string
}

export default function MinimalSelectField({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = '',
  error
}: MinimalSelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-0 py-2 bg-transparent border-none outline-none text-black font-sans appearance-none cursor-pointer ${className} ${value === '' ? 'text-gray-400' : ''}`}
      >
        <option value="" disabled className="font-sans">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-black font-sans">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 font-sans">{error}</p>
      )}
    </div>
  )
}
