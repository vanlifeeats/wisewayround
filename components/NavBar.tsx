import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { TOP_LEVEL_DESTINATIONS } from '@/lib/travel-guides'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Work With Us', href: '/work-with-us' },
]

const ESCAPE_CATEGORIES = [
  { label: 'Foodie Escapes', href: '/escapes/foodie' },
  { label: 'Scuba Escapes', href: '/escapes/scuba' },
  { label: 'City Escapes', href: '/escapes/city' },
]

export function NavBar({ className = '' }: { className?: string }) {
  return (
    <nav
      aria-label="Primary"
      className={`flex flex-wrap items-center justify-center gap-x-7 gap-y-2 ${className}`}
    >
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group relative py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#102A43]/70 transition-colors duration-300 ease-in-out hover:text-[#D97706]"
        >
          {link.label}
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-[#D97706] transition-all duration-300 ease-in-out group-hover:w-full"
          />
        </Link>
      ))}

      <details className="group relative py-1 [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-[#102A43]/70 transition-colors duration-300 ease-in-out marker:content-none hover:text-[#D97706]">
          Travel Guides
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="transition-transform duration-300 ease-in-out group-open:rotate-180"
          />
        </summary>

        <div className="absolute left-1/2 top-full z-10 mt-2 w-[22rem] max-w-[90vw] max-h-[70vh] -translate-x-1/2 overflow-y-auto rounded-xl border border-[#102A43]/10 bg-white p-2 shadow-md">
          <div className="grid grid-cols-2 gap-0.5">
            {TOP_LEVEL_DESTINATIONS.map((destination) => (
              <Link
                key={destination.href}
                href={destination.href}
                className="block rounded-lg px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.1em] text-[#102A43]/70 transition-colors duration-300 ease-in-out hover:bg-[#D97706]/10 hover:text-[#D97706]"
              >
                {destination.label}
              </Link>
            ))}
          </div>
        </div>
      </details>

      <details className="group relative py-1 [&_summary::-webkit-details-marker]:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-bold uppercase tracking-[0.14em] text-[#102A43]/70 transition-colors duration-300 ease-in-out marker:content-none hover:text-[#D97706]">
          Escapes
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="transition-transform duration-300 ease-in-out group-open:rotate-180"
          />
        </summary>

        <div className="absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-xl border border-[#102A43]/10 bg-white p-2 shadow-md">
          {ESCAPE_CATEGORIES.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="block rounded-lg px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.1em] text-[#102A43]/70 transition-colors duration-300 ease-in-out hover:bg-[#D97706]/10 hover:text-[#D97706]"
            >
              {category.label}
            </Link>
          ))}
        </div>
      </details>
    </nav>
  )
}
