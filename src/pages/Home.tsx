import { Hero } from '@/components/home/Hero'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { ProductSection } from '@/components/home/ProductSection'
import { AboutBanner } from '@/components/home/AboutBanner'
import { Benefits } from '@/components/home/Benefits'
import { useAsync } from '@/hooks/useAsync'
import { getActiveCategories } from '@/services/categoryService'
import { getFeaturedProducts, getNewProducts } from '@/services/productService'

export function Home() {
  const { data: categories, loading: loadingCategories } = useAsync(() => getActiveCategories(), [])
  const { data: featured, loading: loadingFeatured } = useAsync(() => getFeaturedProducts(), [])
  const { data: novelties, loading: loadingNew } = useAsync(() => getNewProducts(), [])

  return (
    <>
      <Hero />

      <section className="container-luxe py-16 md:py-24">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-gold">Coleções</p>
        </div>
        <CategoryGrid categories={categories ?? []} loading={loadingCategories} />
      </section>

      <ProductSection
        title="Em destaque"
        subtitle="Peças selecionadas especialmente para você."
        products={featured ?? []}
        loading={loadingFeatured}
        viewAllHref="/produtos"
      />

      <AboutBanner />

      <ProductSection
        title="Novidades"
        subtitle="As últimas peças que chegaram à nossa coleção."
        products={novelties ?? []}
        loading={loadingNew}
        viewAllHref="/produtos?novidades=true"
      />

      <Benefits />
    </>
  )
}
