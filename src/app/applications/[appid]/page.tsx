import HeaderCard from '@/components/Cards/HeaderCard'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ appid: string }>
}

async function getApplication(id: number) {
  const application = await prisma.application.findUnique({
    where: { id }
  })

  if (!application) {
    notFound()
  }

  return application
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { appid } = await params
  const id = parseInt(appid, 10)

  if (isNaN(id)) {
    notFound()
  }

  const application = await getApplication(id)

  const createdDate = new Date(application.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const statusColors: Record<string, string> = {
    New: 'bg-blue-100 text-blue-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800'
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full overflow-y-auto">
      <HeaderCard
        title={`Application #${application.id}`}
        description={`Submitted on ${createdDate}`}
      />
      <div className="flex flex-col w-full p-6 md:p-8">
        <div className="max-w-4xl mx-auto w-full bg-white border border-gray-200 rounded-lg p-6 md:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
              <span className={`px-3 py-1 text-sm font-medium rounded ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>
                {application.status}
              </span>
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-500">Applicant Name</span>
                <span className="text-base text-gray-900">{application.applicant}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-base text-gray-900">{application.email}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-500">Phone</span>
                <span className="text-base text-gray-900">{application.phone}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-500">Property</span>
                <span className="text-base text-gray-900">{application.property}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-500">Unit Number</span>
                <span className="text-base text-gray-900">{application.unitNumber}</span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-500">Move-in Date</span>
                <span className="text-base text-gray-900">{application.moveInDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
