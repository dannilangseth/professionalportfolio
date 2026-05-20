import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Dannielle Langseth — Hospitality, Travel & Lifestyle Photography',
  description: 'Content producer specializing in hospitality, travel, and lifestyle photography. Visual storytelling for hotels, restaurants, and travel brands.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main id="top">{children}</main>
      </body>
    </html>
  )
}
