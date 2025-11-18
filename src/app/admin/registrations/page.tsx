import { prisma } from '@/lib/prisma'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function RegistrationsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const statusFilter = params.status || 'all'

  const registrations = await prisma.registration.findMany({
    where: statusFilter !== 'all' ? { status: statusFilter } : undefined,
    include: {
      service: true,
      schedule: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    all: await prisma.registration.count(),
    pending: await prisma.registration.count({ where: { status: 'pending' } }),
    confirmed: await prisma.registration.count({ where: { status: 'confirmed' } }),
    cancelled: await prisma.registration.count({ where: { status: 'cancelled' } }),
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workshop Registrations</h1>
          <p className="text-gray-600">Manage workshop registrations</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b overflow-x-auto">
          <Link
            href="/admin/registrations"
            className={`px-6 py-3 font-semibold whitespace-nowrap ${
              statusFilter === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({stats.all})
          </Link>
          <Link
            href="/admin/registrations?status=pending"
            className={`px-6 py-3 font-semibold whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({stats.pending})
          </Link>
          <Link
            href="/admin/registrations?status=confirmed"
            className={`px-6 py-3 font-semibold whitespace-nowrap ${
              statusFilter === 'confirmed'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Confirmed ({stats.confirmed})
          </Link>
          <Link
            href="/admin/registrations?status=cancelled"
            className={`px-6 py-3 font-semibold whitespace-nowrap ${
              statusFilter === 'cancelled'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cancelled ({stats.cancelled})
          </Link>
        </div>
      </div>

      {/* Registrations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {registrations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-xl mb-2">No registrations found</p>
            <p className="text-sm">Workshop registrations will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Workshop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{registration.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{registration.service.title}</div>
                      <div className="text-sm text-gray-500">{registration.service.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {registration.schedule ? (
                        <div className="text-sm">
                          <div className="text-gray-900">
                            {new Date(registration.schedule.date).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500">
                            {registration.schedule.startTime} - {registration.schedule.endTime}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No schedule</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{registration.email}</div>
                      {registration.phone && (
                        <div className="text-sm text-gray-500">{registration.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          registration.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : registration.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {registration.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.createdAt).toLocaleDateString()}
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
