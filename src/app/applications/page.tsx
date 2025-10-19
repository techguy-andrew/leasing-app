import HeaderCard from '@/components/Cards/HeaderCard'
import ListItem from '@/components/Items/ListItem'
import { prisma } from '@/lib/prisma'

async function getApplications() {
  const applications = await prisma.application.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  return applications
}

export default async function ApplicationsPage() {
  const applications = await getApplications()

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] w-full overflow-y-auto">
      <HeaderCard
        title="Applications"
        description="View and manage all lease applications"
      />
      <div className="flex flex-col w-full bg-white border-t border-gray-200">
        {applications.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            No applications found
          </div>
        ) : (
          applications.map((app) => (
            <ListItem
              key={app.id}
              id={app.id}
              applicant={app.applicant}
              property={app.property}
              status={app.status}
              moveInDate={app.moveInDate}
              createdAt={app.createdAt.toISOString()}
            />
          ))
        )}
      </div>
    </div>
  )
}
