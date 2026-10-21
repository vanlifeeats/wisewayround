import Link from 'next/link'
import { ExternalLink, Globe, MapPin } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { HeroImage } from '@/components/HeroImage'
import type { DestinationData, Venue } from '@/lib/travel-guides/types'

const DISCLAIMER =
  'Compiled from public sources as of October 2026 — confirm hours, prices and availability before you go.'

function VenueCard({ venue }: { venue: Venue }) {
  return (
    <div className="rounded-xl border border-[#102A43]/10 p-4 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#D97706]/30 hover:shadow-md">
      <h3 className="font-heading text-base font-bold text-[#102A43]">{venue.name}</h3>
      {venue.location && (
        <p className="mt-1 flex items-center gap-1 text-xs text-[#102A43]/60">
          <MapPin size={13} aria-hidden="true" /> {venue.location}
        </p>
      )}
      <p className="mt-2 text-sm text-[#102A43]/80">{venue.description}</p>
      {venue.note && <p className="mt-1 text-xs italic text-[#102A43]/60">{venue.note}</p>}
      {venue.links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {venue.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#D97706] hover:underline"
            >
              {link.label === 'Website' ? <Globe size={13} aria-hidden="true" /> : <ExternalLink size={13} aria-hidden="true" />}
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export function DestinationPage({
  data,
  backHref,
  backLabel,
}: {
  data: DestinationData
  backHref: string
  backLabel: string
}) {
  return (
    <main className="flex min-h-screen flex-col bg-white text-[#102A43]">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 py-16">
        {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG, no need for next/image's optimizer */}
        <img src="/wwr-logo.svg" alt="Wise Way Round" className="h-28 w-28" width={112} height={112} />

        <NavBar className="mt-6" />

        {data.heroImage && (
          <div className="mt-8 w-full">
            <HeroImage src={data.heroImage} alt={data.heroImageAlt ?? data.name} credit={data.heroImageCredit} />
          </div>
        )}

        <div className="mt-10 flex flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">
            Travel Guides
          </p>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
            {data.name}
          </h1>
          <p className="mt-4 max-w-2xl text-[#102A43]/70">{data.tagline}</p>
          <div className="mt-4 max-w-2xl space-y-4 text-left text-sm text-[#102A43]/70">
            {data.intro.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {data.planningLinks && data.planningLinks.length > 0 && (
          <ul className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
            {data.planningLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-[#D97706] hover:underline"
                >
                  <ExternalLink size={13} aria-hidden="true" /> {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 w-full space-y-12 text-left">
          {data.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-xl font-bold text-[#102A43] sm:text-2xl">
                {section.heading}
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {section.venues.map((venue) => (
                  <VenueCard key={`${section.heading}-${venue.name}`} venue={venue} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 max-w-2xl text-center text-xs text-[#102A43]/50">{DISCLAIMER}</p>

        <Link
          href={backHref}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#102A43]/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#102A43] shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#D97706]/30 hover:text-[#D97706] hover:shadow-md"
        >
          {backLabel}
        </Link>
      </div>
    </main>
  )
}
