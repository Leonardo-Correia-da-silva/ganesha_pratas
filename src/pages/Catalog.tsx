import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductFilters } from '@/components/product/ProductFilters'
import { useAsync } from '@/hooks/useAsync'
import { getActiveCategories } from '@/services/categoryService'
import { filterAndSortProducts, getActiveProducts } from '@/services/productService'
import type { ProductFilters as Filters } from '@/types'

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categorySlug = searchParams.get('categoria') ?? ''
  const search = searchParams.get('busca') ?? ''
  const novidades = searchParams.get('novidades') === 'true'
  const sortBy = (searchParams.get('ordenar') as Filters['sortBy'] | null) ?? ''

  const { data: categories } = useAsync(() => getActiveCategories(), [])
  const { data: products, loading } = useAsync(() => getActiveProducts(), [])

  const filtered = useMemo(() => {
    if (!products) return []
    const category = categories?.find((c) => c.slug === categorySlug)

    let base = products
    if (category) {
      base = base.filter((product) => product.categoryId === category.id)
    }
    if (novidades) {
      base = base.filter((product) => product.isNew)
    }

    return filterAndSortProducts(base, { search, sortBy: sortBy || undefined })
  }, [products, categories, categorySlug, search, novidades, sortBy])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className="container-luxe py-12 md:py-16">
      <div className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-gold">Coleção completa</p>
        <h1 className="font-display text-3xl text-ink md:text-4xl">
          {search ? `Resultados para "${search}"` : novidades ? 'Novidades' : 'Todas as joias'}
        </h1>
      </div>

      <div className="mb-10">
        <ProductFilters
          categories={categories ?? []}
          selectedCategorySlug={categorySlug}
          sortBy={sortBy}
          onCategoryChange={(slug) => updateParam('categoria', slug)}
          onSortChange={(sort) => updateParam('ordenar', sort ?? '')}
          resultCount={filtered.length}
        />
      </div>

      <ProductGrid products={filtered} loading={loading} />
    </div>
  )
}
