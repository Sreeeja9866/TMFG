import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageCarousel from "@/components/ImageCarousel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Morning Family Garden - Community Garden & Sustainable Farming",
  description:
    "The Morning Family Garden is a community-driven organization promoting sustainable agriculture, environmental education, and urban gardening. Join our workshops, volunteer programs, and community events.",
  openGraph: {
    title: "The Morning Family Garden - Community Garden & Sustainable Farming",
    description:
      "Join our community garden! Learn sustainable farming, attend workshops, volunteer, and support local food initiatives.",
    type: "website",
  },
};

export default function Home() {
  // Structured Data (JSON-LD) for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Morning Family Garden",
    description:
      "Community-driven organization promoting sustainable agriculture, environmental education, and urban gardening",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logo: `${
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }/images/logo.png`,
    sameAs: [
      // Add your social media links here when available
      // 'https://www.facebook.com/morningfamilygarden',
      // 'https://www.instagram.com/morningfamilygarden',
      // 'https://twitter.com/morningfamilygarden',
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "General Inquiries",
      email: "info@tmfg.org",
    },
    areaServed: {
      "@type": "Place",
      name: "Local Community",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Garden Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Gardening Workshops",
            description:
              "Educational workshops on sustainable gardening practices",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Volunteer Programs",
            description: "Community volunteer opportunities in urban gardening",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Community Events",
            description: "Garden-focused community building events",
          },
        },
      ],
    },
  };

  return (
    <main>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <ImageCarousel
            images={[
              "/images/H2.png",
              "/images/workshop.png",
              "/images/workshop2.png",
              "/images/workshop3.png",
              "/images/composting.png",
            ]}
            interval={4000}
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome to The Morning Family Garden
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Building Community Through Sustainable Gardening & Education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/services" className="btn-primary">
              Explore Workshops
            </Link>
            <Link href="/volunteer" className="btn-secondary">
              Get Involved
            </Link>
            <Link
              href="/donate"
              className="inline-block bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              What We Offer
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover the many ways you can grow, learn, and connect with our
              community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Workshops */}
            <div className="group bg-white p-8 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">🌱</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">
                Workshops
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Learn sustainable farming, seed saving, and organic gardening
                techniques. Classes for kids and adults!
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-secondary hover:text-primary font-semibold group-hover:gap-3 transition-all"
              >
                Learn More
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>

            {/* Volunteering */}
            <div className="group bg-white p-8 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">🤝</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">
                Volunteer
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Join our community of gardeners and help maintain our beautiful
                garden spaces. All skill levels welcome!
              </p>
              <Link
                href="/volunteer"
                className="inline-flex items-center gap-2 text-secondary hover:text-primary font-semibold group-hover:gap-3 transition-all"
              >
                Sign Up
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>

            {/* Community */}
            <div className="group bg-white p-8 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">🌍</div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary">
                Community
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Connect with fellow gardeners, share knowledge, and build
                lasting friendships through our community events.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-secondary hover:text-primary font-semibold group-hover:gap-3 transition-all"
              >
                About Us
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Support Our Mission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Your donation helps us provide free workshops, maintain community
            garden spaces, and promote sustainable agriculture in our
            neighborhood.
          </p>
          <Link
            href="/donate"
            className="inline-block bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Donate Now
          </Link>
        </div>
      </section>

      {/* Latest Blog Posts Preview */}
      <section className="py-20">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary">
            Latest from Our Blog
          </h2>
          <div className="text-center">
            <Link
              href="/blog"
              className="text-secondary hover:text-primary font-semibold text-lg"
            >
              View All Posts →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
