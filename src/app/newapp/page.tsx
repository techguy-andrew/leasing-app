import HeaderCard from '@/components/Cards/HeaderCard'
import FormV2 from '@/components/Form/FormV2'

export default function NewApplication() {
  return (
    <>
      <div className="w-full">
        <HeaderCard
          title="New Lease Application"
          description="Complete the form below to submit your lease application"
        />
      </div>
      <div className="flex items-center justify-center flex-1 p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-b from-gray-50 to-white">
        <FormV2 />
      </div>
    </>
  )
}
