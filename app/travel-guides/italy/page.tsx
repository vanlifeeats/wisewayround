import Link from 'next/link'
import { NavBar } from '@/components/NavBar'

export default function ItalyTravelGuidePage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-[#102A43]">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-6 py-16 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- local trusted SVG, no need for next/image's optimizer */}
        <img src="/wwr-logo.svg" alt="Wise Way Round" className="h-28 w-28" width={112} height={112} />

        <NavBar className="mt-6" />

        <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">
          Travel Guides
        </p>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-[#102A43] sm:text-4xl">
          Italy
        </h1>
        <p className="mt-4 max-w-md text-[#102A43]/70">
          Markets, coastal towns, and the best places to eat and shop across Italy — our guide is
          being written up now.
        </p>

        <Link
          href="/travel-guides"
          className="mt-9 inline-flex items-center gap-2 rounded-full border border-[#102A43]/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#102A43] shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-[#D97706]/30 hover:text-[#D97706] hover:shadow-md"
        >
          Back to Travel Guides
        </Link>
      </div>
    </main>
  )
}
