import { Link } from 'react-router-dom'
import { AtSign, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getStoreSettings } from '@/services/storeSettingsService'
import { getWhatsAppUrl } from '@/services/whatsappService'

export function Footer() {
  const { data: settings } = useAsync(() => getStoreSettings(), [])

  return (
    <footer id="contato" className="border-t border-stone bg-ink text-offwhite">
      <div className="container-luxe grid gap-10 py-16 md:grid-cols-4">
        <div className="space-y-3">
          <p className="font-display text-xl text-paper">{settings?.storeName ?? 'Joias Jaguariúna'}</p>
          <p className="text-sm text-neutral-400">
            Joias escolhidas para transformar momentos em memórias.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-gold">Navegação</p>
          <nav className="flex flex-col gap-2 text-sm text-neutral-300">
            <Link to="/">Início</Link>
            <Link to="/produtos">Joias</Link>
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
                <AtSign className="size-4 text-gold" /> {settings.instagram}
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
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <p className="container-luxe text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} {settings?.storeName ?? 'Joias Jaguariúna'}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
