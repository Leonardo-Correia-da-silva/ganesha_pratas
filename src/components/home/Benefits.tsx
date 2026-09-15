import { Gem, Handshake, ShieldCheck, Truck } from 'lucide-react'

const BENEFITS = [
  { icon: Handshake, title: 'Atendimento personalizado', description: 'Conversamos com você para encontrar a peça ideal.' },
  { icon: Truck, title: 'Entrega local', description: 'Entregamos com cuidado em Jaguariúna e região.' },
  { icon: Gem, title: 'Retirada na loja', description: 'Retire pessoalmente e conheça nosso ateliê.' },
  { icon: ShieldCheck, title: 'Compra segura', description: 'Combine o pagamento diretamente conosco pelo WhatsApp.' },
]

export function Benefits() {
  return (
    <section className="border-y border-stone py-16">
      <div className="container-luxe grid grid-cols-2 gap-8 md:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center gap-3 text-center">
            <Icon className="size-6 text-gold" strokeWidth={1.25} />
            <p className="text-sm font-medium text-ink">{title}</p>
            <p className="text-xs text-neutral-500">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
