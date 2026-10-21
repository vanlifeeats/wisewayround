import Image from 'next/image'

export function HeroImage({
  src,
  alt,
  credit,
}: {
  src: string
  alt: string
  credit?: { name: string; profileUrl: string }
}) {
  if (!src) return null

  return (
    <div>
      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#102A43]/10 shadow-sm sm:h-64 lg:h-80">
        <Image
          fill
          src={src}
          alt={alt}
          sizes="(max-width: 1024px) 100vw, 896px"
          className="object-cover"
        />
      </div>
      {credit && (
        <p className="text-right text-[11px] text-[#102A43]/50">
          Photo by{' '}
          <a
            href={credit.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {credit.name}
          </a>{' '}
          on{' '}
          <a
            href="https://unsplash.com/?utm_source=wisewayround&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Unsplash
          </a>
        </p>
      )}
    </div>
  )
}
