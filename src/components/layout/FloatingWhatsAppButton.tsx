import { MessageCircle } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { getStoreSettings } from '@/services/storeSettingsService'
import { getWhatsAppUrl } from '@/services/whatsappService'

export function FloatingWhatsAppButton() {
  const { data: settings } = useAsync(() => getStoreSettings(), [])

  if (!settings?.whatsapp) return null

  return (
    <a
      href={getWhatsAppUrl(settings.whatsapp, 'Olá! Gostaria de saber mais sobre as joias.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-7" fill="white" />
    </a>
  )
}
