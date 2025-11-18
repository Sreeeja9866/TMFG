import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function DonationSuccessPage() {
  return (
    <main>
      <Navbar />

      <section className="py-20 bg-gray-50">
        <div className="container-custom max-w-2xl text-center">
          <div className="bg-white p-12 rounded-lg shadow-lg">
            <div className="text-6xl mb-6">✓</div>
            <h1 className="text-4xl font-bold text-primary mb-4">
              Thank You for Your Donation!
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Your generous support helps us maintain our community gardens and provide
              free educational workshops.
            </p>
            <p className="text-gray-600 mb-8">
              You should receive a confirmation email shortly. Your donation is tax-deductible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Return Home
              </Link>
              <Link
                href="/services"
                className="bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Explore Our Workshops
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
