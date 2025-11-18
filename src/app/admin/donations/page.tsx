import { prisma } from '@/lib/prisma'

export default async function DonationsPage() {
  const donations = await prisma.donation.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const stats = await prisma.donation.aggregate({
    _sum: {
      amount: true,
    },
    _count: true,
    where: {
      status: 'succeeded',
    },
  })

  const totalAmount = stats._sum.amount || 0
  const totalCount = stats._count || 0

  const statusStats = {
    succeeded: await prisma.donation.count({ where: { status: 'succeeded' } }),
    pending: await prisma.donation.count({ where: { status: 'pending' } }),
    failed: await prisma.donation.count({ where: { status: 'failed' } }),
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Donations</h1>
        <p className="text-gray-600">View and manage donation payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Total Donations</div>
          <div className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</div>
          <div className="text-sm text-gray-500 mt-1">{totalCount} successful donations</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Status Breakdown</div>
          <div className="space-y-1">
            <div className="text-sm">
              <span className="text-green-600 font-semibold">{statusStats.succeeded}</span> Succeeded
            </div>
            <div className="text-sm">
              <span className="text-yellow-600 font-semibold">{statusStats.pending}</span> Pending
            </div>
            <div className="text-sm">
              <span className="text-red-600 font-semibold">{statusStats.failed}</span> Failed
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Average Donation</div>
          <div className="text-3xl font-bold text-primary">
            ${totalCount > 0 ? (totalAmount / totalCount).toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {donations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-xl mb-2">No donations yet</p>
            <p className="text-sm">Donation records will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stripe ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(donation.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.donorName || 'Anonymous'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{donation.donorEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${donation.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">{donation.currency.toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          donation.status === 'succeeded'
                            ? 'bg-green-100 text-green-800'
                            : donation.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 font-mono">
                        {donation.stripePaymentId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {donation.message && (
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {donation.message}
                        </div>
                      )}
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
