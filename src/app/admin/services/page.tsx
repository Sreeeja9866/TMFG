import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'

async function getServices() {
  const services = await prisma.service.findMany({
    include: {
      _count: {
        select: {
          registrations: true,
          schedules: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  return services
}

export const metadata = {
  title: 'Manage Services',
}

export default async function AdminServicesPage() {
  const services = await getServices()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Services & Workshops</h1>
          <p className="text-gray-600 mt-2">Manage your workshops and service offerings</p>
        </div>
        <Link
          href="/admin/services/new"
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
        >
          + Add New Service
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-2">Total Services</p>
          <p className="text-3xl font-bold text-primary">{services.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-2">Active Services</p>
          <p className="text-3xl font-bold text-green-600">
            {services.filter(s => s.active).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm mb-2">Total Registrations</p>
          <p className="text-3xl font-bold text-secondary">
            {services.reduce((sum, s) => sum + s._count.registrations, 0)}
          </p>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {services.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No services yet</p>
            <Link
              href="/admin/services/new"
              className="text-primary hover:underline font-semibold"
            >
              Create your first service →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {services.map((service) => (
              <div key={service.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex gap-6">
                  {/* Image */}
                  {service.image && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {service.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-gray-100 rounded">
                            {service.category}
                          </span>
                          <span>
                            {service.active ? (
                              <span className="text-green-600 font-semibold">● Active</span>
                            ) : (
                              <span className="text-gray-400">● Inactive</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/admin/services/${service.id}/edit`}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors text-sm font-semibold"
                      >
                        Edit
                      </Link>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      {service.duration && (
                        <span>⏱️ {service.duration}</span>
                      )}
                      {service.price !== null && (
                        <span>
                          💰 {service.price === 0 ? 'Free' : `$${service.price}`}
                        </span>
                      )}
                      {service.maxAttendees && (
                        <span>👥 Max {service.maxAttendees} attendees</span>
                      )}
                      <span>📅 {service._count.schedules} schedules</span>
                      <span>✅ {service._count.registrations} registrations</span>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Created: {new Date(service.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
