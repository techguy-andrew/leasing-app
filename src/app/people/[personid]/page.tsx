'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import PersonDetailForm from '@/components/PersonDetailForm'
import LoadingScreen from '@/components/LoadingScreen'
import { fadeIn } from '@/lib/animations/variants'

interface Person {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  status: string
  createdAt: string
  updatedAt: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
}

interface PageProps {
  params: Promise<{ personid: string }>
}

export default function PersonDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [person, setPerson] = useState<Person | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [personId, setPersonId] = useState<number | null>(null)

  useEffect(() => {
    async function loadPerson() {
      try {
        const { personid } = await params
        const id = parseInt(personid, 10)

        if (isNaN(id)) {
          setError('Invalid person ID')
          setIsLoading(false)
          return
        }

        setPersonId(id)

        const response = await fetch(`/api/people/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch person')
        }

        setPerson(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadPerson()
  }, [params])

  const handleSave = async (formData: FormData) => {
    if (!personId) throw new Error('No person ID')

    const response = await fetch(`/api/people/${personId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update person')
    }

    setPerson(data.data)
  }

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/people/${id}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete person')
    }

    router.push('/people')
  }

  const handleCancel = () => {
    // Cancel is handled within PersonDetailForm for edit mode
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error && !person) {
    return (
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-col flex-1 w-full items-center justify-center"
      >
        <div className="text-base text-red-600 px-4 text-center">
          Error: {error}
        </div>
      </motion.div>
    )
  }

  if (!person || !personId) return null

  return (
    <PersonDetailForm
      mode="edit"
      initialData={{
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email || '',
        phone: person.phone || '',
        status: person.status
      }}
      personId={personId}
      onSave={handleSave}
      onCancel={handleCancel}
      onDelete={handleDelete}
      showDeleteButton={true}
    />
  )
}
