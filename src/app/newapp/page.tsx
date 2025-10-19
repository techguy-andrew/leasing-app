import HeaderCard from '@/components/Cards/HeaderCard'
import FormV2 from '@/components/Form/FormV2'

export default function NewApplication() {
  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full overflow-y-auto">
      <HeaderCard
        title="New Lease Application"
        description="Complete the form below to submit your lease application"
      />
      <div className="flex items-center justify-center flex-1 p-4 md:p-6 lg:p-8">
        <FormV2 />
      </div>
    </div>
  )
}
