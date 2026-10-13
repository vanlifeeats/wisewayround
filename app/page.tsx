import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { NavBar } from '@/components/NavBar'

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
    <main className="bg-white text-[#102A43]">
      {/* Hero — fills the viewport like a proper landing page, vertically centred */}
      <section className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          <div className="text-center lg:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG, no need for next/image's optimizer */}
            <img
              src="/wwr-logo.svg"
              alt="Wise Way Round"
              className="mx-auto h-40 w-40 sm:h-48 sm:w-48 lg:mx-0"
              width={192}
              height={192}
            />

            <NavBar className="mt-6 lg:justify-start" />

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">
              Vanlife &middot; Travel &middot; Culture
            </p>

            <h1 className="mx-auto mt-4 max-w-lg font-heading text-2xl font-bold leading-[1.3] tracking-tight text-[#102A43] sm:text-[1.75rem] lg:mx-0 lg:text-3xl">
              We are Zoe and Mark and we are treading the globe, seeking adventure, exploring culture, and finding words of wisdom along the way.
            </h1>

            {/* PLACEHOLDER: "Weekly Vlogs" is an illustrative example tag from
                the client brief, not a verified fact — Zoe & Mark will
                confirm/replace this later. */}
            <div className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start">
              <span className="rounded-full border border-[#102A43]/10 bg-white px-4 py-1.5 text-sm font-semibold text-[#102A43] shadow-sm">
                Full-time Vanlifers
              </span>
              <span className="rounded-full border border-[#2F5D50]/15 bg-white px-4 py-1.5 text-sm font-semibold text-[#2F5D50] shadow-sm">
                Weekly Vlogs
              </span>
            </div>

            <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start" aria-label="Follow us on social media">
              {SOCIALS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-md ${social.chip} [&_svg]:h-[18px] [&_svg]:w-[18px]`}
                >
                  {social.icon}
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-md">
            <div className="absolute -inset-3 -z-10 rounded-[2.25rem] border border-[#D97706]/20" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element -- local trusted photo, simple static asset */}
            <img
              src="/zoe-and-mark.jpg"
              alt="Zoe and Mark on their travels"
              className="w-full rounded-[2rem] object-cover shadow-[0_30px_70px_-15px_rgba(16,42,67,0.35)]"
              width={3672}
              height={4896}
            />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-md backdrop-blur">
              <MapPin size={15} className="text-[#D97706]" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#102A43]">
                Currently Exploring: Europe
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#102A43]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-12 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG, no need for next/image's optimizer */}
            <img src="/wwr-logo.svg" alt="" className="h-9 w-9" width={36} height={36} aria-hidden="true" />
            <Link href="/" className="font-heading text-base font-bold text-[#102A43]">
              Wise Way Round
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className={`flex h-9 w-9 items-center justify-center rounded-full ${social.chip} transition-all duration-300 ease-in-out hover:-translate-y-0.5 [&_svg]:h-4 [&_svg]:w-4`}
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
