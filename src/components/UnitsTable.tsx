'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import Pill from '@/components/Pill'
import { fadeIn } from '@/lib/animations/variants'

interface Property {
  id: number
  name: string
}

interface Unit {
  id: number
  unitNumber: string
  bedrooms: number | null
  bathrooms: number | null
  squareFeet: number | null
  baseRent: string | null
  status: string
  availableOn: Date | string | null
  property: Property
}

interface UnitsTableProps {
  units: Unit[]
}

export default function UnitsTable({ units }: UnitsTableProps) {
  const router = useRouter()

  // Status color mapping
  const getStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
      'Vacant': '#10B981',
      'Occupied': '#3B82F6',
      'Under Maintenance': '#F59E0B',
      'Reserved': '#8B5CF6'
    }
    return statusMap[status] || '#6B7280'
  }

  // Format bed/bath display
  const formatBedBath = (bedrooms: number | null, bathrooms: number | null): string => {
    const bed = bedrooms ?? '-'
    const bath = bathrooms ?? '-'
    return `${bed}/${bath}`
  }

  // Format date
  const formatDate = (date: Date | string | null): string => {
    if (!date) return '-'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="flex flex-col w-full"
    >
      {/* Results count */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <p className="text-sm text-gray-600">
          {units.length} {units.length === 1 ? 'unit' : 'units'}
        </p>
      </div>

      {/* Table */}
      {units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No units found</h3>
          <p className="text-base text-gray-500 max-w-md">
            Try adjusting your filters or add your first unit.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Unit Number
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Bed/Bath
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Price
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Property
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Available On
                </th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, index) => (
                <tr
                  key={unit.id}
                  onClick={() => router.push(`/units/${unit.id}`)}
                  className={`border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {unit.unitNumber}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatBedBath(unit.bedrooms, unit.bathrooms)}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {unit.baseRent || '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {unit.property.name}
                  </td>
                  <td className="px-6 py-4">
                    <Pill label={unit.status} color={getStatusColor(unit.status)} variant="default" />
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatDate(unit.availableOn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
