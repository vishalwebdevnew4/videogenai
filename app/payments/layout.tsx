import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment - AI Video Generator',
  description: 'Complete your payment for AI Video Generator subscription. Secure payment processing through Razorpay.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

