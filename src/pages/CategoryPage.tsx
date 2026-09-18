import { useParams } from 'react-router-dom'
import { ProductGrid } from '@/components/product/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAsync } from '@/hooks/useAsync'
import { getCategoryBySlug } from '@/services/categoryService'
import { getProductsByCategory } from '@/services/productService'

export function CategoryPage() {
  const { slug = '' } = useParams()
  const { data: category, loading: loadingCategory } = useAsync(() => getCategoryBySlug(slug), [slug])
  const { data: products, loading: loadingProducts } = useAsync(async () => {
    const cat = await getCategoryBySlug(slug)
    if (!cat) return []
    return getProductsByCategory(cat.id)
  }, [slug])

  if (!loadingCategory && !category) {
    return (
      <div className="container-luxe py-16">
        <EmptyState title="Categoria não encontrada." />
      </div>
    )
  }

  return (
    <div className="container-luxe py-12 md:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-gold">Categoria</p>
        <h1 className="font-display text-3xl text-ink md:text-4xl">{category?.name ?? ' '}</h1>
        {category?.description && <p className="mt-3 max-w-xl text-sm text-neutral-500">{category.description}</p>}
      </div>

      <ProductGrid products={products ?? []} loading={loadingProducts || loadingCategory} />
    </div>
  )
}
