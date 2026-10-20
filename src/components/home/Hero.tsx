import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '@/hooks/useAsync'
import { getStoreSettings } from '@/services/storeSettingsService'

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1800&auto=format&fit=crop'
const HERO_EYEBROW_PLACEHOLDER = 'Escreva uma etiqueta para a capa em Admin > Configurações.'
const HERO_TITLE_PLACEHOLDER = 'Escreva um título para a capa em Admin > Configurações.'
const HERO_SUBTITLE_PLACEHOLDER = 'Escreva um parágrafo para a capa em Admin > Configurações.'

// Seconds before a video ends to start fading into the next one.
const CROSSFADE_SECONDS = 1.5

function HeroVideos({ videos }: { videos: string[] }) {
  const [active, setActive] = useState(0)
  const [previous, setPrevious] = useState<number | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const advancingRef = useRef(false)

  // Start the active video from the beginning; the previous one keeps playing
  // while it fades out, then gets paused.
  useEffect(() => {
    advancingRef.current = false
    const current = videoRefs.current[active]
    if (current) {
      current.currentTime = 0
      current.play().catch(() => {})
    }
    const timeout = window.setTimeout(() => {
      setPrevious(null)
      videoRefs.current.forEach((video, i) => {
        if (video && i !== active) video.pause()
      })
    }, CROSSFADE_SECONDS * 1000)
    return () => window.clearTimeout(timeout)
  }, [active])

  function advance() {
    if (advancingRef.current) return
    advancingRef.current = true
    setPrevious(active)
    setActive((active + 1) % videos.length)
  }

  if (videos.length === 1) {
    return (
      <video
        src={videos[0]}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 size-full object-cover opacity-70"
      />
    )
  }

  // The incoming video fades in on top of the outgoing one, which stays fully
  // visible underneath, so the picture never dips to black mid-transition.
  return (
    <div className="absolute inset-0 opacity-70">
      {videos.map((url, i) => (
        <video
          key={url}
          ref={(el) => {
            videoRefs.current[i] = el
          }}
          src={url}
          muted
          playsInline
          preload="auto"
          onTimeUpdate={(e) => {
            if (i !== active) return
            const { currentTime, duration } = e.currentTarget
            if (duration && duration - currentTime <= CROSSFADE_SECONDS) advance()
          }}
          onEnded={() => i === active && advance()}
          style={i === active ? { transitionDuration: `${CROSSFADE_SECONDS}s` } : undefined}
          className={`absolute inset-0 size-full object-cover ${
            i === active
              ? 'z-[1] opacity-100 transition-opacity ease-in-out'
              : i === previous
                ? 'z-0 opacity-100'
                : 'z-0 opacity-0'
          }`}
        />
      ))}
    </div>
  )
}

export function Hero() {
  const { data: settings, loading } = useAsync(() => getStoreSettings(), [])
  const videos = settings?.heroVideoUrls ?? []

  return (
    <section className="relative flex h-[85vh] min-h-[520px] items-end overflow-hidden bg-ink md:h-[90vh]">
      {loading ? null : videos.length > 0 ? (
        <HeroVideos videos={videos} />
      ) : (
        <img
          src={settings?.heroImageUrl || DEFAULT_HERO_IMAGE}
          alt="Joia em destaque sobre fundo escuro"
          className="absolute inset-0 size-full object-cover opacity-70"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

      <div className="container-luxe relative z-10 pb-16 pt-32 text-paper md:pb-24">
        {settings?.heroEyebrowEnabled !== false && (
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold-soft">
            {settings?.heroEyebrow || HERO_EYEBROW_PLACEHOLDER}
          </p>
        )}
        {settings?.heroTitleEnabled !== false && (
          <h1 className="text-balance max-w-2xl font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
            {settings?.heroTitle || HERO_TITLE_PLACEHOLDER}
          </h1>
        )}
        {settings?.heroSubtitleEnabled !== false && (
          <p className="mt-5 max-w-md text-balance text-sm text-neutral-200 md:text-base">
            {settings?.heroSubtitle || HERO_SUBTITLE_PLACEHOLDER}
          </p>
        )}
        <Link
          to="/produtos"
          className="mt-8 inline-flex items-center border border-paper px-8 py-4 text-xs uppercase tracking-widest text-paper transition-colors hover:bg-paper hover:text-ink"
        >
          Explorar coleção
        </Link>
      </div>
    </section>
  )
}
