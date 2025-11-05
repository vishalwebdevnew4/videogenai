import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ScrollToTop from '@/components/ScrollToTop'

const inter = Inter({ subsets: ['latin'] })

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aivideogen.com'

export const metadata: Metadata = {
  title: {
    default: 'AI Video Generator - Transform Text & Images into Stunning Videos',
    template: '%s | AI Video Generator',
  },
  description: 'Create professional videos instantly with AI. Generate videos from text prompts or animate static images. Free AI video generation tool with advanced features. No design skills required.',
  keywords: [
    'AI video generator',
    'text to video',
    'image to video',
    'AI video creation',
    'video generation',
    'artificial intelligence video',
    'video maker',
    'AI video tool',
    'create videos with AI',
    'automated video creation',
    'video animation',
    'AI content creation',
  ],
  authors: [{ name: 'AI Video Generator' }],
  creator: 'AI Video Generator',
  publisher: 'AI Video Generator',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI Video Generator - Transform Text & Images into Stunning Videos',
    description: 'Create professional videos instantly with AI. Generate videos from text prompts or animate static images. No design skills required.',
    url: baseUrl,
    siteName: 'AI Video Generator',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Video Generator - Create stunning videos with AI',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Video Generator - Transform Text & Images into Stunning Videos',
    description: 'Create professional videos instantly with AI. Generate videos from text prompts or animate static images.',
    images: ['/og-image.png'],
    creator: '@aivideogen',
    site: '@aivideogen',
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
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
  category: 'technology',
  classification: 'AI Video Generation Tool',
  applicationName: 'AI Video Generator',
  referrer: 'origin-when-cross-origin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aivideogen.com'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'AI Video Generator',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1000',
    },
    description: 'Create professional videos instantly with AI. Generate videos from text prompts or animate static images.',
    url: baseUrl,
    author: {
      '@type': 'Organization',
      name: 'AI Video Generator',
    },
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Video Generator',
    url: baseUrl,
    logo: `${baseUrl}/og-image.png`,
    description: 'AI-powered video generation platform',
    sameAs: [
      // Add social media links when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@aivideogen.com',
    },
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <Navbar />
          <div className="relative z-10">
            {children}
          </div>
          <Footer />
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  )
}

