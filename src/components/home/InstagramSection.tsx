import { AtSign } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getStoreSettings } from '@/services/storeSettingsService'

export function InstagramSection() {
  const { data: settings } = useAsync(() => getStoreSettings(), [])

  if (!settings?.instagram) return null

  return (
    <section className="container-luxe py-16 text-center md:py-20">
      <AtSign className="mx-auto mb-4 size-6 text-gold" strokeWidth={1.25} />
      <h2 className="font-display text-2xl text-ink">Siga-nos no Instagram</h2>
      <p className="mt-2 text-sm text-neutral-500">Acompanhe novidades e bastidores da nossa joalheria.</p>
      <a
        href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block text-sm uppercase tracking-widest text-ink underline underline-offset-4"
      >
        {settings.instagram}
      </a>
    </section>
  )
}
