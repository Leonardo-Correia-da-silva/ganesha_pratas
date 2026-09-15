import { Link } from 'react-router-dom'

export function Hero() {
  return (
    <section className="relative flex h-[85vh] min-h-[520px] items-end overflow-hidden bg-ink md:h-[90vh]">
      <img
        src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1800&auto=format&fit=crop"
        alt="Joia em destaque sobre fundo escuro"
        className="absolute inset-0 size-full object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

      <div className="container-luxe relative z-10 pb-16 pt-32 text-paper md:pb-24">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold-soft">Joalheria em Jaguariúna</p>
        <h1 className="text-balance max-w-2xl font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
          Elegância que permanece.
        </h1>
        <p className="mt-5 max-w-md text-balance text-sm text-neutral-200 md:text-base">
          Joias escolhidas para transformar momentos em memórias.
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
