'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '')

export default function DonatePage() {
  const [amount, setAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const suggestedAmounts = [25, 50, 100, 250, 500]

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError('')

    const donationAmount = amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount)

    if (!donationAmount || donationAmount < 1) {
      setError('Please enter a valid donation amount')
      setIsProcessing(false)
      return
    }

    if (!donorInfo.name || !donorInfo.email) {
      setError('Please provide your name and email')
      setIsProcessing(false)
      return
    }

    try {
      // Create payment intent
      const response = await fetch('/api/donations/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: donationAmount,
          donorName: donorInfo.name,
          donorEmail: donorInfo.email,
          message: donorInfo.message,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg.jpg"
            alt="Donate Background"
            fill
            className="object-cover object-center"
            style={{ objectPosition: 'center 40%' }}
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Support Our Mission</h1>
          <p className="text-xl md:text-2xl">
            Help us grow sustainable communities through education and gardening
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Information Section */}
            <div>
              <h2 className="text-4xl font-bold text-primary mb-6">Why Your Donation Matters</h2>
              <p className="text-lg text-gray-700 mb-6">
                Your generous support helps The Morning Family Garden continue to provide free
                educational workshops, maintain community garden spaces, and promote sustainable
                agriculture in our neighborhood.
              </p>

              <div className="space-y-4 mb-8">
                <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-2xl">📚</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">Free Workshops</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Your donation helps us offer free educational programs for community
                        members of all ages and backgrounds.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-2xl">🌱</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">Garden Maintenance</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Funds support the upkeep of our community gardens, including tools,
                        seeds, soil, and water systems.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-2xl">🤝</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">Community Outreach</h3>
                      <p className="text-gray-700 leading-relaxed">
                        We expand our reach to underserved communities, providing resources
                        and knowledge to those who need it most.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 rounded-3xl shadow-xl">
                <h3 className="text-2xl font-bold mb-6">Impact by the Numbers</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="text-3xl font-bold mb-2">$25</div>
                    <p className="text-sm opacity-90">Provides seeds & supplies for one family</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="text-3xl font-bold mb-2">$50</div>
                    <p className="text-sm opacity-90">Funds a children's workshop</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="text-3xl font-bold mb-2">$100</div>
                    <p className="text-sm opacity-90">Maintains a garden bed for a season</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="text-3xl font-bold mb-2">$250+</div>
                    <p className="text-sm opacity-90">Sponsors a full community event</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Form */}
            <div>
              <div className="bg-white p-8 rounded-3xl shadow-lg sticky top-24 border border-gray-100">
                <h2 className="text-3xl font-bold text-primary mb-6">Make a Donation</h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                  </div>
                )}

                <form onSubmit={handleDonate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3">
                      Select Amount
                    </label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {suggestedAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt.toString())}
                          className={`py-3 px-4 rounded-2xl border-2 font-semibold transition-all duration-300 ${
                            amount === amt.toString()
                              ? 'border-primary bg-primary text-white shadow-lg scale-105'
                              : 'border-gray-300 hover:border-primary hover:scale-105'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAmount('custom')}
                      className={`w-full py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                        amount === 'custom'
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      Custom Amount
                    </button>
                  </div>

                  {amount === 'custom' && (
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Enter Custom Amount *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">
                          $
                        </span>
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          required
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Leave a message of support..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || !amount}
                    className="w-full bg-secondary text-white py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                  </button>

                  <p className="text-sm text-gray-600 text-center">
                    Secure payment powered by Stripe. Your donation is tax-deductible.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
