import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Workshops & Services',
  description: 'Explore our gardening workshops including organic gardening basics, seed saving techniques, urban farming, composting, permaculture design, and kids programs.',
  openGraph: {
    title: 'Gardening Workshops & Services - The Morning Family Garden',
    description: 'Educational programs for all ages and skill levels. From beginner workshops to advanced permaculture design.',
  },
}

async function getServices() {
  try {
    const services = await prisma.service.findMany({
      where: {
        active: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return services
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

export default async function ServicesPage() {
  const services = await getServices()
  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg.jpg"
            alt="Services Background"
            fill
            className="object-cover object-center"
            style={{ objectPosition: 'center 40%' }}
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Our Workshops & Services</h1>
          <p className="text-xl md:text-2xl">
            Educational programs for all ages and skill levels
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Our Workshops</h2>
            <p className="text-gray-600 text-lg">Hands-on learning experiences for all skill levels</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full border border-gray-100"
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-secondary/10 via-primary/10 to-secondary/5">
                  <Image
                    src={service.image || '/images/logo.png'}
                    alt={service.title}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="inline-block text-xs text-white bg-secondary px-4 py-2 rounded-full font-semibold shadow-lg">
                      {service.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      <span className="text-lg font-bold text-primary">
                        {service.price === 0 || service.price === null ? 'Free' : `$${service.price}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-primary group-hover:text-secondary transition-colors line-clamp-2 min-h-[3.5rem]">
                    {service.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-3 flex-grow text-sm leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    {service.duration && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">{service.duration}</span>
                      </div>
                    )}
                    {service.maxAttendees && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">Max {service.maxAttendees} attendees</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/services/${service.slug}`}
                    className="block w-full text-center bg-primary text-white py-3.5 rounded-2xl font-semibold hover:bg-secondary transition-all duration-300 group-hover:shadow-lg mt-auto"
                  >
                    <span className="flex items-center justify-center gap-2">
                      View Details & Register
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-white">
        <div className="container-custom max-w-4xl">
          <h2 className="text-4xl font-bold text-primary text-center mb-8">
            Workshop Information
          </h2>
          <div className="space-y-6 text-gray-700">
            <div>
              <h3 className="text-xl font-bold mb-2 text-primary">Registration</h3>
              <p>
                Click on any workshop to view upcoming dates and register. Some workshops
                are free, while others have a small fee to cover materials.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-primary">Location</h3>
              <p>
                Most workshops are held at our main garden site. Specific location details
                will be provided upon registration.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-primary">What to Bring</h3>
              <p>
                We provide all necessary materials and tools. Just bring yourself, comfortable
                clothes, and a willingness to learn!
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-primary">Questions?</h3>
              <p>
                Contact us at <a href="mailto:info@tmfg.org" className="text-secondary hover:underline">info@tmfg.org</a> or
                call (555) 123-4567 for more information.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
