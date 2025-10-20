interface SelectFieldProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: { value: string; label: string }[]
  placeholder?: string
}

export default function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option"
}: SelectFieldProps) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="flex items-center w-full h-12 p-3 text-base font-sans leading-none border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
    >
      <option value="" disabled className="font-sans">
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value} className="font-sans">
          {option.label}
        </option>
      ))}
    </select>
  )
}
