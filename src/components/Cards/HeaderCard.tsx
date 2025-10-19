interface HeaderCardProps {
  title: string
  description?: string
}

export default function HeaderCard({ title, description }: HeaderCardProps) {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-base md:text-lg text-gray-600">
            {description}
          </p>
        )}
      </div>
    </header>
  )
}
