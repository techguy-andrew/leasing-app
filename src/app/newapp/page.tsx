import HeaderCard from '@/components/Cards/HeaderCard'
import FormV2 from '@/components/Form/FormV2'

export default function NewApplication() {
  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      <HeaderCard
        title="New Lease Application"
        description="Complete the form below to submit your lease application"
      />
      <div className="flex items-center justify-center flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
        <FormV2 />
      </div>
    </div>
  )
}
