import Link from 'next/link'

interface ListItemProps {
  id: number
  applicant: string
  property: string
  status: string
  moveInDate: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800'
}

export default function ListItem({ id, applicant, property, status, moveInDate, createdAt }: ListItemProps) {
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <Link
      href={`/applications/${id}`}
      className="flex items-center justify-between w-full px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-900 truncate">
              {applicant}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
              {status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="truncate">{property}</span>
            <span>Move-in: {moveInDate}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-500 ml-4">
        <span>{date}</span>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
