import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, ShoppingBag } from 'lucide-react'
import { ProductGallery } from '@/components/product/ProductGallery'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAsync } from '@/hooks/useAsync'
import { useCart } from '@/hooks/useCart'
import { getActiveCategories } from '@/services/categoryService'
import { getEffectivePrice, getProductBySlug, getProductMainImage } from '@/services/productService'
import { formatCurrency } from '@/utils/currency'
import type { Category } from '@/types'

export function ProductPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { addItem, items } = useCart()
  const { data: product, loading } = useAsync(() => getProductBySlug(slug), [slug])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [category, setCategory] = useState<Category | null>(null)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [sizeError, setSizeError] = useState(false)

  useEffect(() => {
    setQuantity(1)
    setAdded(false)
    setSelectedSize(undefined)
    setSizeError(false)
  }, [slug])

  useEffect(() => {
    let active = true
    // Categories are loaded separately since a product only stores a categoryId reference.
    async function loadCategory() {
      if (!product) return
      const categories = await getActiveCategories()
      const found = categories.find((c) => c.id === product.categoryId) ?? null
      if (active) setCategory(found)
    }
    loadCategory()
    return () => {
      active = false
    }
  }, [product])

  if (loading) {
    return (
      <div className="container-luxe grid gap-10 py-12 md:grid-cols-2 md:py-16">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-luxe py-16">
        <EmptyState
          title="Produto não encontrado."
          action={
            <Button variant="outline" onClick={() => navigate('/produtos')}>
              Ver catálogo
            </Button>
          }
        />
      </div>
    )
  }

  const soldOut = product.stock <= 0
  const inCartQuantity = items
    .filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity, 0)
  const remainingStock = Math.max(0, product.stock - inCartQuantity)
  const hasPromo = product.promotionalPrice !== null && product.promotionalPrice < product.price
  const sizes = product.sizes ?? []
  const hasSizes = sizes.length > 0

  function handleAddToCart() {
    if (!product || soldOut) return
    if (hasSizes && !selectedSize) {
      setSizeError(true)
      return
    }
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: getProductMainImage(product),
        price: getEffectivePrice(product),
        stock: product.stock,
        size: selectedSize,
      },
      quantity,
    )
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div className="container-luxe py-12 md:py-16">
      <nav className="mb-8 text-xs text-neutral-500">
        <Link to="/">Início</Link> / <Link to="/produtos">Produtos</Link>
        {category && (
          <>
            {' '}
            / <Link to={`/categoria/${category.slug}`}>{category.name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="md:max-w-md">
          <ProductGallery images={product.images} productName={product.name} videoUrl={product.videoUrl} />
        </div>

        <div className="flex flex-col">
          <div className="mb-3 flex gap-2">
            {product.isNew && <Badge variant="new">Novo</Badge>}
            {hasPromo && <Badge variant="sale">Oferta</Badge>}
          </div>

          <h1 className="font-display text-3xl text-ink md:text-4xl">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            {hasPromo ? (
              <>
                <span className="text-2xl text-ink">{formatCurrency(product.promotionalPrice!)}</span>
                <span className="text-base text-neutral-400 line-through">{formatCurrency(product.price)}</span>
              </>
            ) : (
              <span className="text-2xl text-ink">{formatCurrency(product.price)}</span>
            )}
          </div>

          {hasSizes && (
            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-widest text-neutral-500">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size)
                      setSizeError(false)
                    }}
                    className={`flex min-w-10 items-center justify-center border px-3 py-1.5 text-sm transition-colors ${
                      selectedSize === size
                        ? 'border-ink bg-ink text-paper'
                        : 'border-stone text-ink hover:border-neutral-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && <p className="mt-2 text-xs text-red-600">Selecione um tamanho antes de continuar.</p>}
            </div>
          )}

          <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
            {product.description}
          </p>

          <div className="mt-8 border-t border-stone pt-8">
            {soldOut ? (
              <p className="text-sm font-medium uppercase tracking-wide text-red-600">Produto esgotado</p>
            ) : (
              <>
                <p className="mb-4 text-xs uppercase tracking-widest text-neutral-500">
                  {remainingStock <= 5 ? `Últimas ${remainingStock} unidades` : 'Em estoque'}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <QuantitySelector
                    quantity={quantity}
                    max={Math.max(1, remainingStock)}
                    onChange={setQuantity}
                  />
                  <Button
                    onClick={handleAddToCart}
                    disabled={remainingStock === 0}
                    className="flex-1 sm:flex-none"
                  >
                    {added ? (
                      <>
                        <Check className="size-4" /> Adicionado
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="size-4" /> Adicionar ao carrinho
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
