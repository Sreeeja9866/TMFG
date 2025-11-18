import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// List of admin emails - in production, this should be in database or environment variables
const ADMIN_EMAILS = [
  "themorningfamilygarden@gmail.com",
  // Add more admin emails here
];

export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return false
  }

  return ADMIN_EMAILS.includes(session.user.email)
}

export async function requireAdmin() {
  const admin = await isAdmin()

  if (!admin) {
    throw new Error('Unauthorized - Admin access required')
  }

  return true
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions)
  const admin = await isAdmin()

  return {
    session,
    isAdmin: admin,
  }
}
