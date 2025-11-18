'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Volunteer {
  id: string
  name: string
  email: string
  phone: string | null
  availability: string
  interests: string[]
  experience: string | null
  message: string | null
  status: string
  createdAt: string
}

export default function VolunteerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [resolvedId, setResolvedId] = useState<string>('')

  useEffect(() => {
    params.then((p) => {
      setResolvedId(p.id)
      fetchVolunteer(p.id)
    })
  }, [params])

  const fetchVolunteer = async (id: string) => {
    try {
      const response = await fetch(`/api/volunteers?id=${id}`)
      if (response.ok) {
        const data = await response.json()
        setVolunteer(data)
      }
    } catch (error) {
      console.error('Error fetching volunteer:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!resolvedId) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/volunteers/${resolvedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setVolunteer((prev) => prev ? { ...prev, status: newStatus } : null)
        alert('Status updated successfully!')
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status')
    } finally {
      setUpdating(false)
    }
  }

  const deleteVolunteer = async () => {
    if (!resolvedId) return

    if (!confirm('Are you sure you want to delete this volunteer application?')) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/volunteers/${resolvedId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Volunteer deleted successfully')
        router.push('/admin/volunteers')
      } else {
        alert('Failed to delete volunteer')
      }
    } catch (error) {
      console.error('Error deleting volunteer:', error)
      alert('Error deleting volunteer')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!volunteer) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Volunteer Not Found</h1>
        <Link href="/admin/volunteers" className="text-primary hover:underline">
          Back to Volunteers
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/volunteers"
          className="text-primary hover:underline mb-4 inline-block"
        >
          ← Back to Volunteers
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Application</h1>
        <p className="text-gray-600">Review and manage volunteer application</p>
      </div>

      {/* Volunteer Details Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Name</label>
            <p className="text-lg text-gray-900">{volunteer.name}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                volunteer.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : volunteer.status === 'declined'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {volunteer.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
            <p className="text-gray-900">
              <a href={`mailto:${volunteer.email}`} className="text-primary hover:underline">
                {volunteer.email}
              </a>
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Phone</label>
            <p className="text-gray-900">{volunteer.phone || 'Not provided'}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Availability</label>
          <p className="text-gray-900">{volunteer.availability}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {volunteer.interests.map((interest, idx) => (
              <span
                key={idx}
                className="inline-block bg-primary text-white text-sm px-3 py-1 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {volunteer.experience && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Experience</label>
            <p className="text-gray-900 whitespace-pre-wrap">{volunteer.experience}</p>
          </div>
        )}

        {volunteer.message && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Message</label>
            <p className="text-gray-900 whitespace-pre-wrap">{volunteer.message}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Applied On</label>
          <p className="text-gray-900">
            {new Date(volunteer.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-4">
          {volunteer.status !== 'approved' && (
            <button
              onClick={() => updateStatus('approved')}
              disabled={updating}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              ✓ Approve Application
            </button>
          )}

          {volunteer.status !== 'declined' && (
            <button
              onClick={() => updateStatus('declined')}
              disabled={updating}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              ✗ Decline Application
            </button>
          )}

          {volunteer.status !== 'pending' && (
            <button
              onClick={() => updateStatus('pending')}
              disabled={updating}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              ⟲ Mark as Pending
            </button>
          )}

          <button
            onClick={deleteVolunteer}
            disabled={updating}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            🗑️ Delete Application
          </button>
        </div>
      </div>
    </div>
  )
}
