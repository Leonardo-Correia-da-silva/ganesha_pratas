import { Link } from 'react-router-dom'
import { ProductGrid } from '@/components/product/ProductGrid'
import type { Product } from '@/types'

interface ProductSectionProps {
  title: string
  subtitle?: string
  products: Product[]
  loading?: boolean
  viewAllHref?: string
}

export function ProductSection({ title, subtitle, products, loading, viewAllHref }: ProductSectionProps) {
  if (!loading && products.length === 0) return null

  return (
    <section className="container-luxe py-16 md:py-24">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl text-ink md:text-3xl">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-neutral-500">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="hidden shrink-0 text-xs uppercase tracking-widest text-neutral-600 hover:text-ink md:inline"
          >
            Ver tudo
          </Link>
        )}
      </div>
      <ProductGrid products={products} loading={loading} />
    </section>
  )
}
