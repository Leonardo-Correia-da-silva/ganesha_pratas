import { useAsync } from '@/hooks/useAsync'
import { getStoreSettings } from '@/services/storeSettingsService'

const DEFAULT_ABOUT_IMAGE = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1400&auto=format&fit=crop'
const ABOUT_TITLE_PLACEHOLDER = 'Escreva um título para sua loja em Admin > Configurações.'
const ABOUT_TEXT_PLACEHOLDER = 'Escreva sobre sua loja em Admin > Configurações.'

export function AboutBanner() {
  const { data: settings } = useAsync(() => getStoreSettings(), [])

  return (
    <section id="sobre" className="bg-offwhite py-20 md:py-28">
      <div className="container-luxe grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={settings?.aboutImageUrl || DEFAULT_ABOUT_IMAGE}
            alt="Detalhe de joia artesanal"
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="max-w-lg">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Nossa história</p>
          <h2 className="font-display text-3xl leading-snug text-ink md:text-4xl">
            {settings?.aboutTitle || ABOUT_TITLE_PLACEHOLDER}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-neutral-600">
            {settings?.aboutText || ABOUT_TEXT_PLACEHOLDER}
          </p>
        </div>
      </div>
    </section>
  )
}
