import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features - AI Video Generator',
  description: 'Discover powerful features of AI Video Generator: Text to Video, Image to Video, 4K quality, lightning-fast generation, no watermarks, and 24/7 availability. Create professional videos with ease.',
  keywords: [
    'AI video generator features',
    'text to video',
    'image to video',
    'video generation features',
    'AI video tool capabilities',
  ],
  openGraph: {
    title: 'Features - AI Video Generator',
    description: 'Discover powerful features: Text to Video, Image to Video, 4K quality, lightning-fast generation, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Features - AI Video Generator',
    description: 'Discover powerful features: Text to Video, Image to Video, 4K quality, and more.',
  },
  alternates: {
    canonical: '/features',
  },
}

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

