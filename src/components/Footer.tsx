export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8 mt-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">The Morning Family Garden</h3>
            <p className="text-gray-300">
              Building community through sustainable gardening, education, and shared resources.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-300 hover:text-white">About Us</a></li>
              <li><a href="/services" className="text-gray-300 hover:text-white">Services</a></li>
              <li><a href="/volunteer" className="text-gray-300 hover:text-white">Volunteer</a></li>
              <li><a href="/donate" className="text-gray-300 hover:text-white">Donate</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <p className="text-gray-300">Email: info@tmfg.org</p>
            <p className="text-gray-300">Phone: (555) 123-4567</p>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-4 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} The Morning Family Garden. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
