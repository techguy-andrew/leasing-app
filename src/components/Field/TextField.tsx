interface TextFieldProps {
  type?: string
  placeholder?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function TextField({
  type = "text",
  placeholder = "",
  name,
  value,
  onChange
}: TextFieldProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      className="flex items-center w-full h-12 p-3 text-base leading-none border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  )
}
