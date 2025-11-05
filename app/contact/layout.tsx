import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - AI Video Generator',
  description: 'Get in touch with AI Video Generator. Contact our support team for questions, feedback, or assistance with video generation. We\'re here to help you create amazing videos.',
  keywords: [
    'contact AI video generator',
    'video generator support',
    'customer service',
    'help center',
  ],
  openGraph: {
    title: 'Contact Us - AI Video Generator',
    description: 'Get in touch with our support team for questions, feedback, or assistance with video generation.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Us - AI Video Generator',
    description: 'Get in touch with our support team for questions, feedback, or assistance.',
  },
  alternates: {
    canonical: '/contact',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

