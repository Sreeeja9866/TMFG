import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'The Morning Family Garden - Community Garden & Sustainable Farming',
    template: '%s | The Morning Family Garden'
  },
  description: 'The Morning Family Garden is a community-driven organization promoting sustainable agriculture, environmental education, and urban gardening. Join our workshops, volunteer programs, and community events.',
  keywords: [
    'The Morning Family Garden',
    'community garden',
    'sustainable agriculture',
    'urban farming',
    'organic gardening',
    'gardening workshops',
    'environmental education',
    'composting',
    'seed saving',
    'permaculture',
    'volunteer opportunities',
    'community gardening',
    'local food',
    'urban gardening classes'
  ],
  authors: [{ name: 'The Morning Family Garden' }],
  creator: 'The Morning Family Garden',
  publisher: 'The Morning Family Garden',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'The Morning Family Garden - Community Garden & Sustainable Farming',
    description: 'Join our community garden! Learn sustainable farming, attend workshops, volunteer, and support local food initiatives.',
    url: '/',
    siteName: 'The Morning Family Garden',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Morning Family Garden',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Morning Family Garden - Community Garden & Sustainable Farming',
    description: 'Join our community garden! Learn sustainable farming, attend workshops, volunteer, and support local food initiatives.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add these when you set up Google Search Console and other tools
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo.png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <meta name="theme-color" content="#2d5016" />
      </head>
      <body>{children}</body>
    </html>
  )
}
