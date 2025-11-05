import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - AI Video Generator',
  description: 'Manage your AI video generation account. View your videos, subscription details, and generate new videos.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

