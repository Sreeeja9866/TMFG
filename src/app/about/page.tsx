import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about The Morning Family Garden's mission to promote sustainable agriculture, environmental education, and community building through urban gardening initiatives.",
  openGraph: {
    title: "About The Morning Family Garden",
    description:
      "Founded in 2015, we've grown from a small community plot to a thriving organization serving hundreds of community members.",
  },
};

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg.jpg"
            alt="About Background"
            fill
            className="object-cover object-center"
            style={{ objectPosition: 'center 40%' }}
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold">About Us</h1>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-primary mb-6">
              Our Mission
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Text Content */}
              <div className="flex-1">
                <p className="text-lg text-gray-700 mb-4">
                  The Morning Family Garden is a community-driven organization
                  dedicated to promoting sustainable agriculture, environmental
                  education, and community building through urban gardening
                  initiatives.
                </p>
                <p className="text-lg text-gray-700">
                  We believe that everyone should have access to fresh, healthy
                  food and the knowledge to grow it themselves. Through our
                  workshops, volunteer programs, and community events, we're
                  creating a greener, more connected neighborhood.
                </p>
              </div>

              {/* Helen's Image - Smaller */}
              <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                <Image
                  src="/images/Helen.jpeg"
                  alt="Helen - Founder"
                  fill
                  className="object-cover object-center"
                  sizes="224px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">Our Values</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The principles that guide our work and community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group bg-white p-8 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 text-center border border-gray-100">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">🌱</div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">
                Sustainability
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Promoting eco-friendly practices and organic gardening methods.
              </p>
            </div>
            <div className="group bg-white p-8 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 text-center border border-gray-100">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">🤝</div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Building connections through shared gardening experiences.
              </p>
            </div>
            <div className="group bg-white p-8 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 text-center border border-gray-100">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">📚</div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">Education</h3>
              <p className="text-gray-600 leading-relaxed">
                Sharing knowledge about sustainable farming and gardening.
              </p>
            </div>
            <div className="group bg-white p-8 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-500 text-center border border-gray-100">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="text-4xl">🌍</div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary">
                Accessibility
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Making fresh food and education available to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-primary mb-6">Our Story</h2>
            <p className="text-lg text-gray-700 mb-4">
              Founded in 2015, The Morning Family Garden started as a small
              community plot where neighbors came together to grow fresh
              produce. What began with just a handful of volunteers has grown
              into a thriving organization serving hundreds of community
              members.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Today, we operate multiple garden sites, offer regular workshops
              for all ages, and continue to expand our impact through education,
              outreach, and community engagement.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-primary text-center mb-12">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="text-5xl font-bold text-secondary mb-2">500+</div>
              <p className="text-gray-700">Community Members Served</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl font-bold text-secondary mb-2">50+</div>
              <p className="text-gray-700">Workshops Conducted Annually</p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl font-bold text-secondary mb-2">100+</div>
              <p className="text-gray-700">Active Volunteers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Whether you want to volunteer, attend a workshop, or support our
            mission, there are many ways to get involved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/volunteer"
              className="bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Volunteer Today
            </a>
            <a
              href="/donate"
              className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              Support Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
