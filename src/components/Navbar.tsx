'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', path: '/', icon: '🏡' },
    { name: 'About', path: '/about', icon: '📖' },
    { name: 'Services', path: '/services', icon: '🌱' },
    { name: 'Blog', path: '/blog', icon: '✍️' },
    { name: 'Volunteer', path: '/volunteer', icon: '🤝' },
  ]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg'
        : 'bg-white shadow-md'
    }`}>
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary transition-all duration-300">
                <Image
                  src="/images/logo.png"
                  alt="TMFG Logo"
                  fill
                  className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 hidden sm:block"></span>
              </div>
            </Link>
            <Link
              href="/auth/signin"
              className="flex flex-col group"
            >
              <span className="text-xl font-bold text-primary group-hover:text-secondary transition-colors cursor-pointer">TMFG</span>
              
              <span className="text-[10px] text-gray-400 group-hover:text-primary transition-colors hidden sm:block"></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`group relative px-4 py-2 rounded-2xl font-medium transition-all duration-300 ${
                  pathname === item.path
                    ? 'text-white bg-primary shadow-lg'
                    : 'text-gray-700 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </span>
                {pathname !== item.path && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                )}
              </Link>
            ))}

            {/* Donate Button */}
            <Link
              href="/donate"
              className="ml-4 bg-gradient-to-r from-secondary to-primary text-white px-6 py-2.5 rounded-2xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-lg">💚</span>
              <span>Donate</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}>
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                  pathname === item.path
                    ? 'text-white bg-primary shadow-lg'
                    : 'text-gray-700 hover:bg-primary/5 hover:text-primary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Mobile Donate Button */}
            <Link
              href="/donate"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-primary text-white px-4 py-3 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="text-xl">💚</span>
              <span>Donate Now</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
