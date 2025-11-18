import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ServiceRegistrationForm from './ServiceRegistrationForm'
import { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getService(slug: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        schedules: {
          where: {
            date: {
              gte: new Date() // Only show future schedules
            }
          },
          orderBy: {
            date: 'asc'
          }
        }
      }
    })
    return service
  } catch (error) {
    console.error('Error fetching service:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)

  if (!service) {
    return {
      title: 'Service Not Found',
    }
  }

  const price = service.price === null || service.price === 0 ? 'Free' : `$${service.price}`

  return {
    title: service.title,
    description: `${service.description} ${service.duration ? `Duration: ${service.duration}.` : ''} ${price} workshop.`,
    openGraph: {
      title: service.title,
      description: service.description,
      type: 'website',
      images: service.image ? [service.image] : undefined,
    },
  }
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const service = await getService(slug)

  if (!service) {
    notFound()
  }

  return (
    <main>
      <Navbar />

      {/* Header Section */}
      <section className="py-12 bg-gradient-to-b from-secondary/5 to-gray-50">
        <div className="container-custom max-w-6xl">
          <div className="text-center mb-8">
            <span className="inline-block text-white bg-secondary px-4 py-2 rounded-full font-semibold mb-4">
              {service.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">{service.title}</h1>
          </div>

          {/* Featured Image */}
          <div className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-secondary/10 via-primary/10 to-secondary/5">
            <Image
              src={service.image || '/images/logo.png'}
              alt={service.title}
              fill
              className="object-contain p-8"
              priority
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-custom max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
                <h2 className="text-3xl font-bold text-primary mb-4">About This Workshop</h2>
                <div className="prose max-w-none whitespace-pre-line text-gray-700">
                  {service.description}
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold text-primary mb-4">Workshop Details</h2>
                <div className="space-y-3 text-gray-700">
                  {service.duration && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">Duration:</span>
                      <span>{service.duration}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold">Price:</span>
                    <span className="text-lg font-bold text-primary">
                      {service.price === null || service.price === 0 ? 'Free' : `$${service.price}`}
                    </span>
                  </div>
                  {service.maxAttendees && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-semibold">Max Attendees:</span>
                      <span>{service.maxAttendees} people</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-1">
              <ServiceRegistrationForm
                serviceId={service.id}
                serviceSlug={slug}
                schedules={service.schedules}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
