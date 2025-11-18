import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin/auth'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin - TMFG',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, isAdmin } = await getAdminSession()

  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin')
  }

  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-2xl font-bold">
                TMFG Admin
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link href="/admin" className="hover:text-accent transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin/services" className="hover:text-accent transition-colors">
                  Services
                </Link>
                <Link href="/admin/blog" className="hover:text-accent transition-colors">
                  Blog
                </Link>
                <Link href="/admin/volunteers" className="hover:text-accent transition-colors">
                  Volunteers
                </Link>
                <Link href="/admin/registrations" className="hover:text-accent transition-colors">
                  Registrations
                </Link>
                <Link href="/admin/donations" className="hover:text-accent transition-colors">
                  Donations
                </Link>
                <Link href="/admin/newsletter" className="hover:text-accent transition-colors">
                  Newsletter
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{session.user?.email}</span>
              <Link
                href="/"
                className="bg-white text-primary px-4 py-2 rounded hover:bg-gray-100 transition-colors text-sm font-semibold"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-primary-dark text-white px-4 py-3 overflow-x-auto">
        <div className="flex gap-4 whitespace-nowrap">
          <Link href="/admin" className="text-sm hover:text-accent">
            Dashboard
          </Link>
          <Link href="/admin/services" className="text-sm hover:text-accent">
            Services
          </Link>
          <Link href="/admin/blog" className="text-sm hover:text-accent">
            Blog
          </Link>
          <Link href="/admin/volunteers" className="text-sm hover:text-accent">
            Volunteers
          </Link>
          <Link href="/admin/registrations" className="text-sm hover:text-accent">
            Registrations
          </Link>
          <Link href="/admin/donations" className="text-sm hover:text-accent">
            Donations
          </Link>
          <Link href="/admin/newsletter" className="text-sm hover:text-accent">
            Newsletter
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>The Morning Family Garden Admin Panel</p>
        </div>
      </footer>
    </div>
  )
}
