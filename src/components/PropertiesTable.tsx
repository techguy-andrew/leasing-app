'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { fadeIn } from '@/lib/animations/variants'

interface Property {
  id: number
  name: string
  street: string
  city: string
  state: string
  zip: string
  energyProvider: string
  createdAt: Date
  updatedAt: Date
}

interface PropertiesTableProps {
  properties: Property[]
  onlyBody?: boolean
  stickyHeader?: boolean
}

export default function PropertiesTable({ properties, onlyBody = false, stickyHeader = false }: PropertiesTableProps) {
  const router = useRouter()

  // Format date
  const formatDate = (date: Date): string => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // If stickyHeader prop is true, render table with sticky thead
  if (stickyHeader) {
    return properties.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
        <p className="text-base text-gray-500 max-w-md">
          Try adjusting your filters or add your first property.
        </p>
      </div>
    ) : (
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-50">
              Property Name
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-50">
              Address
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-50">
              City
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-50">
              State
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-50">
              Energy Provider
            </th>
            <th className="px-6 py-3 text-left font-semibold text-gray-700 bg-gray-50">
              Created
            </th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property, index) => (
            <tr
              key={property.id}
              onClick={() => router.push(`/properties/${property.id}`)}
              className={`border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {property.name}
              </td>
              <td className="px-6 py-4 text-gray-700">
                {property.street}
              </td>
              <td className="px-6 py-4 text-gray-700">
                {property.city}
              </td>
              <td className="px-6 py-4 text-gray-700">
                {property.state}
              </td>
              <td className="px-6 py-4 text-gray-700">
                {property.energyProvider}
              </td>
              <td className="px-6 py-4 text-gray-700">
                {formatDate(property.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  // If onlyBody prop is true, render only tbody for scrollable section
  if (onlyBody) {
    return (
      <div className="w-full overflow-x-auto bg-white">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-base text-gray-500 max-w-md">
              Try adjusting your filters or add your first property.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {properties.map((property, index) => (
                <tr
                  key={property.id}
                  onClick={() => router.push(`/properties/${property.id}`)}
                  className={`border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {property.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {property.street}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {property.city}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {property.state}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {property.energyProvider}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatDate(property.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }

  // Full table with headers
  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="flex flex-col w-full"
    >
      {/* Table */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
          <p className="text-base text-gray-500 max-w-md">
            Try adjusting your filters or add your first property.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Property Name
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Address
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  City
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  State
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Energy Provider
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-700">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property, index) => (
                <tr
                  key={property.id}
                  onClick={() => router.push(`/properties/${property.id}`)}
                  className={`border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {property.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {property.street}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {property.city}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {property.state}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {property.energyProvider}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatDate(property.createdAt)}
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
