import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeContext'
import { SessionProvider } from '@/components/SessionProvider'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wisewayround.co.uk'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Wise Way Round | Travel & Adventure',
  description: 'Treading the globe. Seeking adventure. Exploring culture. Finding words of wisdom along the way.',
  icons: {
    icon: '/wwr-logo.svg',
    shortcut: '/wwr-logo.svg',
    apple: '/wwr-logo.svg',
  },
  openGraph: {
    type: 'website',
    title: 'Wise Way Round | Travel & Adventure',
    description: 'Treading the globe. Seeking adventure. Exploring culture. Finding words of wisdom along the way.',
    url: SITE_URL,
    images: ['/og-image.jpg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${plusJakartaSans.variable}`}>
      <body>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
