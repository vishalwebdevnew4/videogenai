import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register - AI Video Generator',
  description: 'Create your free AI Video Generator account. Start creating stunning videos with AI. Sign up now and get 5 free videos per month.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

