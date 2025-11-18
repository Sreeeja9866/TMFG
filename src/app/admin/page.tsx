import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getDashboardStats() {
  const [
    totalServices,
    totalBlogPosts,
    totalVolunteers,
    pendingVolunteers,
    totalRegistrations,
    pendingRegistrations,
    totalDonations,
    totalNewsletterSubscribers,
  ] = await Promise.all([
    prisma.service.count({ where: { active: true } }),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.volunteer.count(),
    prisma.volunteer.count({ where: { status: 'pending' } }),
    prisma.registration.count(),
    prisma.registration.count({ where: { status: 'pending' } }),
    prisma.donation.count(),
    prisma.newsletter.count({ where: { active: true } }),
  ])

  const donationSum = await prisma.donation.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: 'succeeded',
    },
  })

  return {
    totalServices,
    totalBlogPosts,
    totalVolunteers,
    pendingVolunteers,
    totalRegistrations,
    pendingRegistrations,
    totalDonations,
    totalDonationAmount: donationSum._sum.amount || 0,
    totalNewsletterSubscribers,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Active Services',
      value: stats.totalServices,
      link: '/admin/services',
      icon: '🌱',
      color: 'bg-green-500',
    },
    {
      title: 'Published Blog Posts',
      value: stats.totalBlogPosts,
      link: '/admin/blog',
      icon: '📝',
      color: 'bg-blue-500',
    },
    {
      title: 'Volunteers',
      value: stats.totalVolunteers,
      subtitle: `${stats.pendingVolunteers} pending`,
      link: '/admin/volunteers',
      icon: '🤝',
      color: 'bg-purple-500',
    },
    {
      title: 'Registrations',
      value: stats.totalRegistrations,
      subtitle: `${stats.pendingRegistrations} pending`,
      link: '/admin/registrations',
      icon: '📋',
      color: 'bg-orange-500',
    },
    {
      title: 'Total Donations',
      value: `$${stats.totalDonationAmount.toFixed(2)}`,
      subtitle: `${stats.totalDonations} donations`,
      link: '/admin/donations',
      icon: '💰',
      color: 'bg-yellow-500',
    },
    {
      title: 'Newsletter Subscribers',
      value: stats.totalNewsletterSubscribers,
      link: '/admin/newsletter',
      icon: '📧',
      color: 'bg-pink-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to The Morning Family Garden Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <Link
            key={index}
            href={card.link}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {card.icon}
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-semibold mb-2">{card.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
            {card.subtitle && (
              <p className="text-sm text-gray-500">{card.subtitle}</p>
            )}
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/services/new"
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-center"
          >
            + Add Service
          </Link>
          <Link
            href="/admin/blog/new"
            className="bg-secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-center"
          >
            + New Blog Post
          </Link>
          <Link
            href="/admin/volunteers?status=pending"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-center"
          >
            Review Volunteers
          </Link>
          <Link
            href="/admin/registrations?status=pending"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors text-center"
          >
            Review Registrations
          </Link>
        </div>
      </div>
    </div>
  )
}
