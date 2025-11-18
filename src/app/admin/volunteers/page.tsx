import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function VolunteersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const statusFilter = params.status || 'all'

  const volunteers = await prisma.volunteer.findMany({
    where: statusFilter !== 'all' ? { status: statusFilter } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    all: await prisma.volunteer.count(),
    pending: await prisma.volunteer.count({ where: { status: 'pending' } }),
    approved: await prisma.volunteer.count({ where: { status: 'approved' } }),
    declined: await prisma.volunteer.count({ where: { status: 'declined' } }),
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteers</h1>
          <p className="text-gray-600">Manage volunteer applications</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b overflow-x-auto">
          <Link
            href="/admin/volunteers"
            className={`px-6 py-3 font-semibold ${
              statusFilter === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({stats.all})
          </Link>
          <Link
            href="/admin/volunteers?status=pending"
            className={`px-6 py-3 font-semibold ${
              statusFilter === 'pending'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({stats.pending})
          </Link>
          <Link
            href="/admin/volunteers?status=approved"
            className={`px-6 py-3 font-semibold ${
              statusFilter === 'approved'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approved ({stats.approved})
          </Link>
          <Link
            href="/admin/volunteers?status=declined"
            className={`px-6 py-3 font-semibold ${
              statusFilter === 'declined'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Declined ({stats.declined})
          </Link>
        </div>
      </div>

      {/* Volunteers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {volunteers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-xl mb-2">No volunteers found</p>
            <p className="text-sm">Volunteer applications will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {volunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{volunteer.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{volunteer.email}</div>
                      {volunteer.phone && (
                        <div className="text-sm text-gray-500">{volunteer.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{volunteer.availability}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {volunteer.interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          volunteer.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : volunteer.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {volunteer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(volunteer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/volunteers/${volunteer.id}`}
                        className="text-primary hover:text-secondary font-semibold"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
