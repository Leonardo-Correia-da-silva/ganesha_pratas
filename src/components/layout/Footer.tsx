import { Link } from 'react-router-dom'
import { Mail, MapPin, MessageCircle } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getStoreSettings } from '@/services/storeSettingsService'
import { getWhatsAppUrl } from '@/services/whatsappService'
import { formatZipCode } from '@/utils/cep'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export function Footer() {
  const { data: settings } = useAsync(() => getStoreSettings(), [])

  return (
    <footer id="contato" className="relative overflow-hidden border-t border-stone bg-ink text-offwhite">
      {settings?.footerBackgroundUrl && (
        <>
          <img
            src={settings.footerBackgroundUrl}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-ink/80" />
        </>
      )}

      <div className="container-luxe relative z-10 grid gap-10 py-16 md:grid-cols-4">
        <div className="space-y-3">
          {settings?.footerLogoUrl || settings?.logoUrl ? (
            <img
              src={settings.footerLogoUrl ?? settings.logoUrl ?? undefined}
              alt={settings.storeName}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <p className="font-display text-xl text-paper">{settings?.storeName ?? 'Joias Jaguariúna'}</p>
          )}
          <p className="text-sm text-neutral-400">
            Joias escolhidas para transformar momentos em memórias.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-gold">Navegação</p>
          <nav className="flex flex-col gap-2 text-sm text-neutral-300">
            <Link to="/">Início</Link>
            <Link to="/produtos">Produtos</Link>
            <Link to="/produtos?novidades=true">Novidades</Link>
            <Link to="/#sobre">Sobre</Link>
          </nav>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-gold">Contato</p>
          <div className="flex flex-col gap-2.5 text-sm text-neutral-300">
            {settings?.whatsapp && (
              <a
                href={getWhatsAppUrl(settings.whatsapp, 'Olá! Gostaria de saber mais sobre as joias.')}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-paper"
              >
                <MessageCircle className="size-4 text-gold" /> WhatsApp
              </a>
            )}
            {settings?.instagram && (
              <a
                href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-paper"
              >
                <InstagramIcon className="size-4 text-gold" /> {settings.instagram}
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:text-paper">
                <Mail className="size-4 text-gold" /> {settings.email}
              </a>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-gold">Localização</p>
          <p className="flex items-start gap-2 text-sm text-neutral-300">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
            {settings?.address ? `${settings.address}, ` : ''}
            {settings?.city ?? 'Jaguariúna'} - {settings?.state ?? 'SP'}
            {settings?.zipCode ? `, ${formatZipCode(settings.zipCode)}` : ''}
          </p>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 py-5">
        <p className="container-luxe text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} {settings?.storeName ?? 'Joias Jaguariúna'}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
