import HeaderCard from '@/components/Cards/HeaderCard'
import ListItem from '@/components/Items/ListItem'

interface Application {
  id: number
  status: string
  moveInDate: string
  property: string
  unitNumber: string
  applicant: string
  email: string
  phone: string
  createdAt: string
  updatedAt: string
}

async function getApplications() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/applications`, {
    cache: 'no-store'
  })

  if (!res.ok) {
    throw new Error('Failed to fetch applications')
  }

  const data = await res.json()
  return data.data as Application[]
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
              createdAt={app.createdAt}
            />
          ))
        )}
      </div>
    </div>
  )
}
