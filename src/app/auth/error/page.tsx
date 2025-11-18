'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: 'Server Configuration Error',
      description: 'There is a problem with the server configuration. Please contact support.',
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in.',
    },
    Verification: {
      title: 'Verification Error',
      description: 'The verification token has expired or has already been used.',
    },
    OAuthSignin: {
      title: 'OAuth Sign In Error',
      description: 'Error occurred during OAuth sign in.',
    },
    OAuthCallback: {
      title: 'OAuth Callback Error',
      description: 'Error occurred during OAuth callback.',
    },
    OAuthCreateAccount: {
      title: 'Could Not Create Account',
      description: 'Could not create OAuth account.',
    },
    EmailCreateAccount: {
      title: 'Could Not Create Account',
      description: 'Could not create email account.',
    },
    Callback: {
      title: 'Callback Error',
      description: 'Error occurred during callback.',
    },
    OAuthAccountNotLinked: {
      title: 'Account Not Linked',
      description: 'An account already exists with the same email address but different sign-in method.',
    },
    EmailSignin: {
      title: 'Email Sign In Error',
      description: 'The e-mail could not be sent.',
    },
    CredentialsSignin: {
      title: 'Sign In Failed',
      description: 'The credentials you provided are incorrect.',
    },
    SessionRequired: {
      title: 'Session Required',
      description: 'You must be signed in to access this page.',
    },
    Default: {
      title: 'Authentication Error',
      description: 'An error occurred during authentication.',
    },
  }

  const errorInfo = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default

  return (
    <main>
      <Navbar />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {errorInfo.title}
            </h1>

            <p className="text-gray-600 mb-8">
              {errorInfo.description}
            </p>

            {error === 'Verification' && (
              <p className="text-sm text-gray-500 mb-6">
                Please request a new verification link.
              </p>
            )}

            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </Link>

              <Link
                href="/"
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">
                Need help?{' '}
                <a
                  href="mailto:support@tmfg.org"
                  className="text-secondary hover:underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
