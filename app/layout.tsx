import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeContext'
import { SessionProvider } from '@/components/SessionProvider'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wisewayround.co.uk'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Wise Way Round | Travel & Adventure',
  description: 'Treading the globe. Seeking adventure. Exploring culture. Finding words of wisdom along the way.',
  openGraph: {
    type: 'website',
    title: 'Wise Way Round | Travel & Adventure',
    description: 'Treading the globe. Seeking adventure. Exploring culture. Finding words of wisdom along the way.',
    url: SITE_URL,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
