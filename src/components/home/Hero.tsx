import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAsync } from '@/hooks/useAsync'
import { getStoreSettings } from '@/services/storeSettingsService'

const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1800&auto=format&fit=crop'
const HERO_EYEBROW_PLACEHOLDER = 'Escreva uma etiqueta para a capa em Admin > Configurações.'
const HERO_TITLE_PLACEHOLDER = 'Escreva um título para a capa em Admin > Configurações.'
const HERO_SUBTITLE_PLACEHOLDER = 'Escreva um parágrafo para a capa em Admin > Configurações.'

export function Hero() {
  const { data: settings, loading } = useAsync(() => getStoreSettings(), [])
  const [videoIndex, setVideoIndex] = useState(0)
  const videos = settings?.heroVideoUrls ?? []

  return (
    <section className="relative flex h-[85vh] min-h-[520px] items-end overflow-hidden bg-ink md:h-[90vh]">
      {loading ? null : videos.length > 0 ? (
        <video
          key={videos[videoIndex % videos.length]}
          src={videos[videoIndex % videos.length]}
          autoPlay
          loop={videos.length === 1}
          muted
          playsInline
          onEnded={() => setVideoIndex((i) => i + 1)}
          className="absolute inset-0 size-full object-cover opacity-70"
        />
      ) : (
        <img
          src={settings?.heroImageUrl || DEFAULT_HERO_IMAGE}
          alt="Joia em destaque sobre fundo escuro"
          className="absolute inset-0 size-full object-cover opacity-70"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

      <div className="container-luxe relative z-10 pb-16 pt-32 text-paper md:pb-24">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold-soft">
          {settings?.heroEyebrow || HERO_EYEBROW_PLACEHOLDER}
        </p>
        <h1 className="text-balance max-w-2xl font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
          {settings?.heroTitle || HERO_TITLE_PLACEHOLDER}
        </h1>
        <p className="mt-5 max-w-md text-balance text-sm text-neutral-200 md:text-base">
          {settings?.heroSubtitle || HERO_SUBTITLE_PLACEHOLDER}
        </p>
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
