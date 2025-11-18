import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function VerifyRequestPage() {
  return (
    <main>
      <Navbar />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h1>

            <p className="text-gray-600 mb-6">
              A sign in link has been sent to your email address.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                Click the link in the email to sign in to your account. The link will expire in 24 hours.
              </p>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <p>
                <strong>Didn&apos;t receive the email?</strong>
              </p>
              <ul className="text-left space-y-2 pl-6">
                <li className="list-disc">Check your spam or junk folder</li>
                <li className="list-disc">Make sure you entered the correct email address</li>
                <li className="list-disc">Wait a few minutes for the email to arrive</li>
              </ul>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
              >
                Try Another Email
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
