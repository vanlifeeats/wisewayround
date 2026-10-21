import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { NavBar } from '@/components/NavBar'
import { HeroImage } from '@/components/HeroImage'
import { TOP_LEVEL_DESTINATIONS } from '@/lib/travel-guides'
import { HUB_HERO_IMAGES } from '@/lib/travel-guides/hub-hero-images'

export default function TravelGuidesPage() {
  const hero = HUB_HERO_IMAGES['travel-guides-index']

  return (
    <main className="flex min-h-screen flex-col bg-white text-[#102A43]">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-6 py-16 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG, no need for next/image's optimizer */}
        <img src="/wwr-logo.svg" alt="Wise Way Round" className="h-28 w-28" width={112} height={112} />

        <NavBar className="mt-6" />

        <div className="mt-8 w-full">
          <HeroImage src={hero.url} alt={hero.alt} credit={hero.credit} />
        </div>

        <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">
          Travel Guides
        </p>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
          Where to next?
        </h1>
        <p className="mt-4 max-w-md text-[#102A43]/70">
          Pick a country to dive into our guides, written up as we travel.
        </p>

        <div className="mt-9 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOP_LEVEL_DESTINATIONS.map((destination) => (
            <Link
              key={destination.href}
              href={destination.href}
              className="group flex items-center justify-between rounded-xl border border-[#102A43]/10 bg-white px-5 py-4 text-left font-semibold text-[#102A43] shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#D97706]/30 hover:text-[#D97706] hover:shadow-md"
            >
              {destination.label}
              <ChevronRight
                size={18}
                aria-hidden="true"
                className="text-[#102A43]/40 transition-colors duration-300 ease-in-out group-hover:text-[#D97706]"
              />
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-9 inline-flex items-center gap-2 rounded-full border border-[#102A43]/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#102A43] shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#D97706]/30 hover:text-[#D97706] hover:shadow-md"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
