export function AboutBanner() {
  return (
    <section id="sobre" className="bg-offwhite py-20 md:py-28">
      <div className="container-luxe grid items-center gap-10 md:grid-cols-2 md:gap-16">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1400&auto=format&fit=crop"
            alt="Detalhe de joia artesanal"
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="max-w-lg">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Nossa história</p>
          <h2 className="font-display text-3xl leading-snug text-ink md:text-4xl">
            Uma joalheria de Jaguariúna, feita para durar gerações.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-neutral-600">
            Selecionamos cada peça com cuidado, pensando em momentos que merecem ser eternizados. Nosso
            atendimento é próximo, pessoal e pensado para quem valoriza exclusividade e qualidade acima de
            tudo.
          </p>
        </div>
      </div>
    </section>
  )
}
