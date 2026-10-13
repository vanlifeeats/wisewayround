import Link from 'next/link'
import { MapPin } from 'lucide-react'

const SOCIALS = [
  {
    name: 'YouTube',
    href: 'https://youtube.com/@wisewayround',
    chip: 'bg-[#FF0000]',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path fill="#fff" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12Z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/wisewayround',
    chip: 'bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5]',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path fill="#fff" d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2 0 2 .2 2.4.4.6.2 1 .5 1.5 1 .4.4.7.9 1 1.5.2.4.3 1.2.4 2.4 0 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c0 1.2-.2 2-.4 2.4-.2.6-.5 1-1 1.5-.4.4-.9.7-1.5 1-.4.2-1.2.3-2.4.4-1.2 0-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2 0-2-.2-2.4-.4-.6-.2-1-.5-1.5-1-.4-.4-.7-.9-1-1.5-.2-.4-.3-1.2-.4-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c0-1.2.2-2 .4-2.4.2-.6.5-1 1-1.5.4-.4.9-.7 1.5-1 .4-.2 1.2-.3 2.4-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-1 .1-1.6.2-1.9.3-.5.2-.8.4-1.2.7-.3.4-.5.7-.7 1.2-.1.3-.2.9-.3 1.9-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1 .2 1.6.3 1.9.2.5.4.8.7 1.2.4.3.7.5 1.2.7.3.1.9.2 1.9.3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 1.9-.3.5-.2.8-.4 1.2-.7.3-.4.5-.7.7-1.2.1-.3.2-.9.3-1.9.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.3-1.9a3.1 3.1 0 0 0-.7-1.2 3.1 3.1 0 0 0-1.2-.7c-.3-.1-.9-.2-1.9-.3-1.2-.1-1.6-.1-4.7-.1Zm0 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm5.7-3.5a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    href: 'https://tiktok.com/@wisewayround',
    chip: 'bg-black',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path fill="#25F4EE" transform="translate(-0.9, -0.6)" d="M16.6 2h-3.3v13.9c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.3 0 .6 0 .9.1v-3.4a6 6 0 0 0-.9-.1 6.1 6.1 0 0 0-6.1 6.1 6.1 6.1 0 0 0 6.1 6.1 6.1 6.1 0 0 0 6.1-6.1V8.8a7.6 7.6 0 0 0 4.3 1.3V6.8a4.3 4.3 0 0 1-4.4-4.3Z" />
        <path fill="#FE2C55" transform="translate(0.9, 0.6)" d="M16.6 2h-3.3v13.9c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.3 0 .6 0 .9.1v-3.4a6 6 0 0 0-.9-.1 6.1 6.1 0 0 0-6.1 6.1 6.1 6.1 0 0 0 6.1 6.1 6.1 6.1 0 0 0 6.1-6.1V8.8a7.6 7.6 0 0 0 4.3 1.3V6.8a4.3 4.3 0 0 1-4.4-4.3Z" />
        <path fill="#fff" d="M16.6 2h-3.3v13.9c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 0 1-2.7-2.7 2.7 2.7 0 0 1 2.7-2.7c.3 0 .6 0 .9.1v-3.4a6 6 0 0 0-.9-.1 6.1 6.1 0 0 0-6.1 6.1 6.1 6.1 0 0 0 6.1 6.1 6.1 6.1 0 0 0 6.1-6.1V8.8a7.6 7.6 0 0 0 4.3 1.3V6.8a4.3 4.3 0 0 1-4.4-4.3Z" />
      </svg>
    ),
  },
]

export default function HomePage() {
  return (
    <main className="bg-[#FDFBF7] text-[#102A43]">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-20 lg:pt-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6 flex items-center justify-center gap-3 lg:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG, no need for next/image's optimizer */}
              <img src="/wwr-logo.svg" alt="" className="h-10 w-10" width={40} height={40} />
              <span className="font-heading text-xl font-bold tracking-tight text-[#102A43]">
                Wise Way Round
              </span>
            </div>

            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-[#102A43] sm:text-5xl lg:text-6xl">
              Treading the globe. Seeking adventure. Exploring culture.
            </h1>

            <p className="mt-5 text-lg text-[#102A43]/80">
              We&apos;re Zoe &amp; Mark — trading the ordinary for the open road.
            </p>

            {/* PLACEHOLDER: "30+ Countries" and "Weekly Vlogs" are illustrative
                example stats from the client brief, not verified facts — Zoe &
                Mark will confirm/replace these numbers later. */}
            <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
              <span className="rounded-full bg-[#102A43]/5 px-4 py-1.5 text-sm font-semibold text-[#102A43]">
                Full-time Vanlifers
              </span>
              <span className="rounded-full bg-[#D97706]/10 px-4 py-1.5 text-sm font-semibold text-[#C05621]">
                30+ Countries
              </span>
              <span className="rounded-full bg-[#2F5D50]/10 px-4 py-1.5 text-sm font-semibold text-[#2F5D50]">
                Weekly Vlogs
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm flex-shrink-0 lg:mx-0 lg:max-w-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- local trusted photo, simple static asset */}
            <img
              src="/zoe-and-mark.jpg"
              alt="Zoe and Mark on their travels"
              className="w-full rounded-3xl object-cover shadow-[0_24px_60px_rgba(16,42,67,0.25)]"
              width={3672}
              height={4896}
            />
            <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-full bg-[#FDFBF7] px-4 py-2 shadow-lg">
              <MapPin size={16} className="text-[#D97706]" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#102A43]">
                Currently Exploring: [Location]
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Connect & Watch — small sleek icon row */}
      <section className="mx-auto max-w-6xl px-6 pb-24" aria-label="Follow us on social media">
        <div className="flex items-center justify-center gap-4 lg:justify-start">
          {SOCIALS.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className={`flex h-11 w-11 items-center justify-center rounded-full ${social.chip} shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg [&_svg]:h-5 [&_svg]:w-5`}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#102A43]/10 bg-[#FDFBF7]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <nav className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium text-[#102A43]/70">
            <Link href="/" className="hover:text-[#102A43]">Home</Link>
            <a href="https://youtube.com/@wisewayround" target="_blank" rel="noopener noreferrer" className="hover:text-[#102A43]">YouTube</a>
            <a href="https://instagram.com/wisewayround" target="_blank" rel="noopener noreferrer" className="hover:text-[#102A43]">Instagram</a>
            <a href="https://tiktok.com/@wisewayround" target="_blank" rel="noopener noreferrer" className="hover:text-[#102A43]">TikTok</a>
          </nav>

          <div className="flex items-center gap-4">
            {SOCIALS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${social.chip} [&_svg]:h-4 [&_svg]:w-4`}
              >
                {social.icon}
              </a>
            ))}
          </div>

          <p className="text-sm text-[#102A43]/60">&copy; 2026 Wise Way Round</p>
        </div>
      </footer>
    </main>
  )
}
