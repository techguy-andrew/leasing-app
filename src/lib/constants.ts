// Shared constants for application options

export const STATUS_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' }
]

export const PROPERTY_OPTIONS = [
  { value: 'Burbank Village Apartments', label: 'Burbank Village Apartments' },
  { value: 'Carlisle Apartments', label: 'Carlisle Apartments' },
  { value: 'Clover Hills Apartments', label: 'Clover Hills Apartments' },
  { value: 'Legacy Apartments', label: 'Legacy Apartments' },
  { value: 'Norwalk Village Estates', label: 'Norwalk Village Estates' },
  { value: 'NW Pine Apartments', label: 'NW Pine Apartments' },
  { value: 'Orchard Meadows Apartments', label: 'Orchard Meadows Apartments' },
  { value: 'Parkside Luxury Apartments', label: 'Parkside Luxury Apartments' },
  { value: 'Prairie Village', label: 'Prairie Village' },
  { value: 'West Glen Apartments', label: 'West Glen Apartments' }
]

export const STATUS_COLORS: Record<string, string> = {
  All: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  New: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  Pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  Approved: 'bg-green-100 text-green-800 hover:bg-green-200',
  Rejected: 'bg-red-100 text-red-800 hover:bg-red-200'
} as const

export const STATUS_BADGE_COLORS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800'
} as const
