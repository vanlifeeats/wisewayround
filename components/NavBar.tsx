import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Work With Us', href: '/work-with-us' },
  { label: 'Our Retreats', href: '/our-retreats' },
  { label: 'Travel Guides', href: '/travel-guides' },
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
    </nav>
  )
}
