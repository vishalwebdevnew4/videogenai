import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing Plans - AI Video Generator',
  description: 'Choose the perfect plan for your video creation needs. Free plan available with 5 videos per month. Pro and Enterprise plans with advanced features, no watermarks, and commercial license.',
  keywords: [
    'AI video generator pricing',
    'video generation plans',
    'affordable video creation',
    'video generator subscription',
    'AI video tool pricing',
  ],
  openGraph: {
    title: 'Pricing Plans - AI Video Generator',
    description: 'Choose the perfect plan for your video creation needs. Free plan available with 5 videos per month. Pro and Enterprise plans available.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pricing Plans - AI Video Generator',
    description: 'Choose the perfect plan for your video creation needs. Free plan available.',
  },
  alternates: {
    canonical: '/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

