'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    availability: '',
    interests: [] as string[],
    experience: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const availabilityOptions = [
    'Weekday Mornings',
    'Weekday Afternoons',
    'Weekday Evenings',
    'Weekend Mornings',
    'Weekend Afternoons',
    'Flexible',
  ]

  const interestOptions = [
    'Garden Maintenance',
    'Workshop Assistance',
    'Event Planning',
    'Social Media',
    'Fundraising',
    'Kids Programs',
    'Administrative Support',
    'Other',
  ]

  const handleInterestChange = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          availability: '',
          interests: [],
          experience: '',
          message: '',
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Volunteer registration error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
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
            alt="Volunteer Background"
            fill
            className="object-cover object-center"
            style={{ objectPosition: 'center 40%' }}
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Volunteer With Us</h1>
          <p className="text-xl md:text-2xl">
            Join our community and make a difference in your neighborhood
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Information Section */}
            <div>
              <h2 className="text-4xl font-bold text-primary mb-6">Why Volunteer?</h2>
              <p className="text-lg text-gray-700 mb-6">
                Volunteering at The Morning Family Garden is a rewarding way to give back to your
                community, learn new skills, and connect with like-minded individuals who share
                your passion for sustainable living and gardening.
              </p>

              <div className="space-y-4 mb-8">
                <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-2xl">🌱</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">Learn & Grow</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Develop new gardening skills and knowledge about sustainable agriculture
                        from experienced gardeners and educators.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-2xl">🤝</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">Build Community</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Meet neighbors, make friends, and be part of a vibrant community working
                        together for a common goal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-2xl">💚</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">Make an Impact</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Contribute to food security, environmental sustainability, and community
                        wellbeing in tangible ways.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <div className="text-2xl">⏰</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">Flexible Schedule</h3>
                      <p className="text-gray-700 leading-relaxed">
                        We offer various volunteer opportunities that can fit your schedule, from
                        one-time events to regular commitments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 rounded-3xl shadow-lg border border-primary/10">
                <h3 className="text-2xl font-bold text-primary mb-6">Volunteer Opportunities</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-xs mr-3 flex-shrink-0">✓</span>
                    <span className="leading-relaxed">Garden maintenance and planting</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-xs mr-3 flex-shrink-0">✓</span>
                    <span className="leading-relaxed">Workshop and event assistance</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-xs mr-3 flex-shrink-0">✓</span>
                    <span className="leading-relaxed">Educational program support</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-xs mr-3 flex-shrink-0">✓</span>
                    <span className="leading-relaxed">Fundraising and outreach</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-xs mr-3 flex-shrink-0">✓</span>
                    <span className="leading-relaxed">Administrative tasks</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-xs mr-3 flex-shrink-0">✓</span>
                    <span className="leading-relaxed">Social media and communications</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Registration Form */}
            <div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <h2 className="text-3xl font-bold text-primary mb-6">Sign Up to Volunteer</h2>

                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    Thank you for signing up! We'll be in touch soon with volunteer opportunities.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    Something went wrong. Please try again later.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Availability *</label>
                    <select
                      required
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select your availability...</option>
                      {availabilityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Areas of Interest (select all that apply)
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {interestOptions.map((interest) => (
                        <label key={interest} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest)}
                            onChange={() => handleInterestChange(interest)}
                            className="mr-2"
                          />
                          <span className="text-sm">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Previous Gardening Experience
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select experience level...</option>
                      <option value="none">No experience</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Tell us more about yourself (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Why do you want to volunteer? What skills or ideas do you bring?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </button>
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
