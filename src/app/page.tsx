import HeaderCard from '@/components/Cards/HeaderCard'

export default function Home() {
  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full overflow-y-auto">
      <HeaderCard
        title="Leasing Application Portal"
        description="Manage and submit lease applications with ease"
      />
      <div className="flex flex-col items-center justify-center flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Leasing App</h2>
          <p className="text-lg text-gray-600">Use the menu to navigate</p>
        </div>
      </div>
    </div>
  )
}
